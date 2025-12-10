// app/api/bookings/[id]/pay/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../../lib/auth";
import db from "../../../../lib/db";

export async function POST(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Xử lý params
    let id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    } else {
      id = params?.id;
    }

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đặt phòng" },
        { status: 400 }
      );
    }

    const { payment_method, payment_data } = await req.json();

    // Kiểm tra booking có tồn tại không
    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE id = ?",
      [id]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    // Kiểm tra quyền: chỉ chủ sở hữu booking mới thanh toán được
    const bookingUserId = parseInt(booking.user_id);
    const currentUserId = parseInt(user.id);

    if (user.role !== "admin" && bookingUserId !== currentUserId) {
      return NextResponse.json(
        { message: "Bạn không có quyền thanh toán booking này" },
        { status: 403 }
      );
    }

    // Kiểm tra booking đã được thanh toán chưa (có status pending/paid/completed)
    if (booking.status === "pending" || booking.status === "paid" || booking.status === "completed") {
      return NextResponse.json(
        { message: "Booking này đã được thanh toán hoặc đã có trạng thái" },
        { status: 400 }
      );
    }

    // Cập nhật status thành "pending" (sau khi thanh toán thành công) và lưu payment_method
    try {
      // Kiểm tra xem bảng có cột payment_method không
      const sql = `
        UPDATE bookings 
        SET status = 'pending', payment_method = ?
        WHERE id = ?
      `;
      await db.query(sql, [payment_method || "credit_card", id]);
    } catch (error) {
      // Nếu không có cột payment_method, chỉ cập nhật status
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 1054) {
        const sql = `
          UPDATE bookings 
          SET status = 'pending'
          WHERE id = ?
        `;
        await db.query(sql, [id]);
      } else {
        throw error;
      }
    }

    // Log payment (có thể lưu vào bảng payments nếu có)
    // TODO: Tạo bảng payments để lưu chi tiết thanh toán

    return NextResponse.json({
      message: "Thanh toán thành công, đặt phòng đã được xác nhận",
      booking_id: id,
      status: "pending", // Set status = "pending" sau khi thanh toán thành công
      payment_method: payment_method || "credit_card",
    });
  } catch (error) {
    console.error("POST /api/bookings/[id]/pay error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server khi thanh toán",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


