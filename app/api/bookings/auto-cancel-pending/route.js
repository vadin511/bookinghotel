// app/api/bookings/auto-cancel-pending/route.js
// API endpoint để tự động hủy các booking pending đã quá checkout time
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";
import { sendBookingCancellationEmailToAdmin, sendBookingCancellationEmailToUser } from "../../../utils/mailer";

export async function POST(req) {
  try {
    // Chỉ admin mới có quyền gọi API này
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Chỉ admin mới có quyền thực hiện" },
        { status: 401 }
      );
    }

    // Lấy thời gian hiện tại để kiểm tra 12:00 PM ngày checkout
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Tìm tất cả booking có status = "pending" và đã QUÁ checkout
    // Logic: ngày checkout < hôm nay HOẶC (ngày checkout = hôm nay VÀ giờ hiện tại >= 12:00 PM)
    const [allPendingBookings] = await db.query(
      `
      SELECT b.id, b.user_id, b.check_in, b.check_out, b.status, b.total_price,
             h.name AS hotel_name,
             u.name AS user_name, u.email AS user_email
      FROM bookings b
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending'
        AND b.check_out IS NOT NULL
        AND DATE(b.check_out) <= DATE(?)
    `,
      [today]
    );

    // Filter để chỉ lấy booking đã quá 12:00 PM ngày checkout
    const pendingBookings = allPendingBookings.filter(booking => {
      const checkoutDate = new Date(booking.check_out);
      const checkoutDateOnly = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());
      const checkoutDateAt12PM = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate(), 12, 0, 0);
      
      // Nếu ngày checkout < hôm nay → đã quá
      if (checkoutDateOnly < today) {
        return true;
      }
      
      // Nếu ngày checkout = hôm nay → kiểm tra giờ hiện tại >= 12:00 PM
      if (checkoutDateOnly.getTime() === today.getTime()) {
        return now >= checkoutDateAt12PM;
      }
      
      return false;
    });

    if (pendingBookings.length === 0) {
      return NextResponse.json({
        message: "Không có booking nào cần hủy",
        cancelled_count: 0,
      });
    }

    // Lấy email admin để gửi thông báo
    let adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      const [adminUsers] = await db.query(
        "SELECT email FROM users WHERE role = 'admin' LIMIT 1"
      );
      if (adminUsers.length > 0) {
        adminEmail = adminUsers[0].email;
      } else {
        adminEmail = process.env.FROM_EMAIL;
      }
    }

    // Cập nhật từng booking thành cancelled
    let cancelledCount = 0;
    const errors = [];
    const cancelledBookings = [];

    for (const booking of pendingBookings) {
      try {
        await db.query(
          `
          UPDATE bookings 
          SET status = 'cancelled', 
              cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận',
              cancellation_type = 'system'
          WHERE id = ?
        `,
          [booking.id]
        );
        cancelledCount++;
        
        // Lưu thông tin booking đã hủy để gửi email
        cancelledBookings.push(booking);
      } catch (error) {
        console.error(`Error cancelling booking ${booking.id}:`, error);
        errors.push({
          booking_id: booking.id,
          error: error.message,
        });
      }
    }

    // Gửi email thông báo cho admin và user về các booking đã hủy tự động
    if (cancelledBookings.length > 0) {
      try {
        // Lấy thông tin chi tiết phòng cho từng booking
        for (const booking of cancelledBookings) {
          const [roomDetails] = await db.query(`
            SELECT r.name AS room_name
            FROM booking_details bd
            LEFT JOIN rooms r ON bd.room_id = r.id
            WHERE bd.booking_id = ?
            LIMIT 1
          `, [booking.id]);

          const room_name = roomDetails.length > 0 ? roomDetails[0].room_name : 'N/A';
          const checkInDate = new Date(booking.check_in);
          const checkOutDate = new Date(booking.check_out);
          const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
          const cancellationReason = 'Phòng đã bị hủy do chưa được xác nhận';

          // Gửi email cho admin
          if (adminEmail) {
            await sendBookingCancellationEmailToAdmin(adminEmail, {
              booking_id: booking.id,
              user_name: booking.user_name || 'N/A',
              user_email: booking.user_email || 'N/A',
              hotel_name: booking.hotel_name || 'N/A',
              room_name: room_name,
              check_in: booking.check_in,
              check_out: booking.check_out,
              total_price: booking.total_price || 0,
              nights: nights,
              cancellation_reason: cancellationReason,
              cancellation_type: 'system'
            }).catch(err => {
              console.error(`Lỗi gửi email thông báo hủy booking #${booking.id} cho admin:`, err);
            });
          }

          // Gửi email cho user
          if (booking.user_email) {
            await sendBookingCancellationEmailToUser(booking.user_email, {
              booking_id: booking.id,
              user_name: booking.user_name || 'N/A',
              hotel_name: booking.hotel_name || 'N/A',
              room_name: room_name,
              check_in: booking.check_in,
              check_out: booking.check_out,
              total_price: booking.total_price || 0,
              nights: nights,
              cancellation_reason: cancellationReason,
              cancelled_by: 'system' // Hệ thống tự động hủy
            }).catch(err => {
              console.error(`Lỗi gửi email thông báo hủy booking #${booking.id} cho user:`, err);
            });
          }
        }
      } catch (emailError) {
        console.error('Lỗi khi gửi email thông báo hủy tự động:', emailError);
      }
    }

    return NextResponse.json({
      message: `Đã hủy ${cancelledCount} booking pending quá checkout`,
      cancelled_count: cancelledCount,
      total_found: pendingBookings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("POST /api/bookings/auto-cancel-pending error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint để xem danh sách booking sẽ bị hủy (không thực hiện hủy)
export async function GET(req) {
  try {
    // Chỉ admin mới có quyền xem
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Chỉ admin mới có quyền xem" },
        { status: 401 }
      );
    }

    // Lấy thời gian hiện tại để kiểm tra 12:00 PM ngày checkout
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Tìm tất cả booking có status = "pending" và đã quá checkout
    // Logic: ngày checkout < hôm nay HOẶC (ngày checkout = hôm nay VÀ giờ hiện tại >= 12:00 PM)
    const [allPendingBookings] = await db.query(
      `
      SELECT b.id, b.user_id, b.check_in, b.check_out, b.status, b.created_at,
             h.name AS hotel_name,
             u.name AS user_name, u.email AS user_email
      FROM bookings b
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending'
        AND b.check_out IS NOT NULL
        AND DATE(b.check_out) <= DATE(?)
      ORDER BY b.check_out ASC
    `,
      [today]
    );

    // Filter để chỉ lấy booking đã quá 12:00 PM ngày checkout
    const pendingBookings = allPendingBookings.filter(booking => {
      const checkoutDate = new Date(booking.check_out);
      const checkoutDateOnly = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());
      const checkoutDateAt12PM = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate(), 12, 0, 0);
      
      // Nếu ngày checkout < hôm nay → đã quá
      if (checkoutDateOnly < today) {
        return true;
      }
      
      // Nếu ngày checkout = hôm nay → kiểm tra giờ hiện tại >= 12:00 PM
      if (checkoutDateOnly.getTime() === today.getTime()) {
        return now >= checkoutDateAt12PM;
      }
      
      return false;
    });

    return NextResponse.json({
      message: `Tìm thấy ${pendingBookings.length} booking pending đã quá checkout`,
      count: pendingBookings.length,
      bookings: pendingBookings,
    });
  } catch (error) {
    console.error("GET /api/bookings/auto-cancel-pending error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

