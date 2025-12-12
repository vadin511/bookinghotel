// app/api/bookings/auto-cancel-cron/route.js
// API endpoint để tự động hủy các booking pending đã quá checkout time
// Endpoint này có thể được gọi bởi cron job hoặc scheduled task
// Bảo mật bằng secret key trong environment variable
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { sendBookingCancellationEmailToAdmin, sendBookingCancellationEmailToUser } from "../../../utils/mailer";

export async function POST(req) {
  try {
    // Kiểm tra secret key để bảo mật
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.CRON_SECRET_KEY || process.env.ADMIN_SECRET_KEY;
    
    if (!secretKey) {
      console.error("CRON_SECRET_KEY chưa được cấu hình trong environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Kiểm tra secret key từ header
    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid secret key" },
        { status: 401 }
      );
    }

    // Lấy thời gian hiện tại để kiểm tra 12:00 PM ngày checkout
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // 12:00 PM hôm nay

    console.log(`[Auto Cancel Cron] Đang kiểm tra booking pending quá checkout vào ${now.toISOString()}`);

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

    console.log(`[Auto Cancel Cron] Tìm thấy ${pendingBookings.length} booking cần hủy`);

    if (pendingBookings.length === 0) {
      return NextResponse.json({
        message: "Không có booking nào cần hủy",
        cancelled_count: 0,
        timestamp: new Date().toISOString(),
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
        console.log(`[Auto Cancel Cron] Đã hủy booking #${booking.id}`);
      } catch (error) {
        console.error(`[Auto Cancel Cron] Error cancelling booking ${booking.id}:`, error);
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
              console.error(`[Auto Cancel Cron] Lỗi gửi email thông báo hủy booking #${booking.id} cho admin:`, err);
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
              console.error(`[Auto Cancel Cron] Lỗi gửi email thông báo hủy booking #${booking.id} cho user:`, err);
            });
          }
        }
      } catch (emailError) {
        console.error('[Auto Cancel Cron] Lỗi khi gửi email thông báo hủy tự động:', emailError);
      }
    }

    console.log(`[Auto Cancel Cron] Hoàn thành: Đã hủy ${cancelledCount}/${pendingBookings.length} booking`);

    return NextResponse.json({
      message: `Đã hủy ${cancelledCount} booking pending quá checkout`,
      cancelled_count: cancelledCount,
      total_found: pendingBookings.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Auto Cancel Cron] POST /api/bookings/auto-cancel-cron error:", error);
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

// GET endpoint để kiểm tra (không thực hiện hủy)
export async function GET(req) {
  try {
    // Kiểm tra secret key
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.CRON_SECRET_KEY || process.env.ADMIN_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid secret key" },
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Auto Cancel Cron] GET /api/bookings/auto-cancel-cron error:", error);
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





