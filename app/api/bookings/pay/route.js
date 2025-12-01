// app/api/bookings/pay/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";
import { sendBookingConfirmationEmail } from "../../../utils/mailer";

// Tạo booking mới và thanh toán trong một lần
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { room_id, check_in, check_out, total_price, payment_method, payment_data } =
      await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (!room_id || !check_in || !check_out || !total_price) {
      return NextResponse.json(
        { message: "Thiếu trường bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra ngày tháng hợp lệ
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        { message: "Ngày check-in không được là quá khứ" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: "Ngày check-out phải sau ngày check-in" },
        { status: 400 }
      );
    }

    // Lấy thông tin phòng để lấy hotel_id và price_per_night
    const [rooms] = await db.query("SELECT hotel_id, price_per_night FROM rooms WHERE id = ?", [room_id]);
    if (rooms.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy phòng" },
        { status: 404 }
      );
    }

    const room = rooms[0];
    const hotel_id = room.hotel_id;
    const price_per_night = room.price_per_night;

    // Kiểm tra phòng có còn trống không (kiểm tra qua booking_details)
    const checkAvailabilitySql = `
      SELECT COUNT(*) as count
      FROM booking_details bd
      JOIN bookings b ON bd.booking_id = b.id
      WHERE bd.room_id = ?
        AND (b.status IN ('pending', 'confirmed', 'paid') OR b.status IS NULL)
        AND ? < b.check_out
        AND ? > b.check_in
    `;

    const [availabilityResult] = await db.query(checkAvailabilitySql, [
      room_id,
      check_in,
      check_out,
    ]);

    if (availabilityResult[0].count > 0) {
      return NextResponse.json(
        { 
          message: "Rất tiếc, phòng này đã được đặt bởi khách hàng khác trong khoảng thời gian bạn chọn. Vui lòng chọn khoảng thời gian khác."
        },
        { status: 409 }
      );
    }

    // Bắt đầu transaction: Tạo booking và thanh toán
    // Tạo booking với status = "pending" (sau khi thanh toán thành công)
    const bookingSql = `
      INSERT INTO bookings (user_id, hotel_id, check_in, check_out, status, total_price, payment_method, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())
    `;

    const [bookingResult] = await db.query(bookingSql, [
      user.id,
      hotel_id,
      check_in,
      check_out,
      total_price,
      payment_method || "credit_card",
    ]);

    const bookingId = bookingResult.insertId;

    // Tạo booking_details
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const subtotal = price_per_night * nights;

    const bookingDetailsSql = `
      INSERT INTO booking_details (booking_id, room_id, quantity, price_per_night, subtotal)
      VALUES (?, ?, 1, ?, ?)
    `;

    await db.query(bookingDetailsSql, [
      bookingId,
      room_id,
      price_per_night,
      subtotal,
    ]);

    // Lấy thông tin đầy đủ để gửi email
    try {
      const [bookingInfo] = await db.query(`
        SELECT 
          b.id AS booking_id,
          b.check_in,
          b.check_out,
          b.total_price,
          u.name AS user_name,
          u.email AS user_email,
          h.name AS hotel_name,
          r.name AS room_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN hotels h ON b.hotel_id = h.id
        LEFT JOIN booking_details bd ON b.id = bd.booking_id
        LEFT JOIN rooms r ON bd.room_id = r.id
        WHERE b.id = ?
      `, [bookingId]);

      if (bookingInfo.length > 0 && bookingInfo[0].user_email) {
        const booking = bookingInfo[0];
        
        // Gửi email xác nhận (không chặn response nếu email lỗi)
        sendBookingConfirmationEmail(booking.user_email, {
          booking_id: booking.booking_id,
          user_name: booking.user_name,
          hotel_name: booking.hotel_name,
          room_name: booking.room_name,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_price: booking.total_price,
          nights: nights
        }).catch(err => {
          console.error('Lỗi gửi email xác nhận đặt phòng:', err);
          // Không throw error để không ảnh hưởng đến response thành công
        });
      }
    } catch (emailError) {
      console.error('Lỗi khi lấy thông tin để gửi email:', emailError);
      // Không throw error để không ảnh hưởng đến response thành công
    }

    // Log payment (có thể lưu vào bảng payments nếu có)
    // TODO: Tạo bảng payments để lưu chi tiết thanh toán

    return NextResponse.json({
      message: "Thanh toán thành công, đặt phòng đã được xác nhận",
      booking_id: bookingId,
      status: "pending",
      payment_method: payment_method || "credit_card",
    });
  } catch (error) {
    console.error("POST /api/bookings/pay error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server khi thanh toán",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

