// app/api/bookings/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

// Tạo booking
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { room_id, check_in, check_out, status, total_price } =
      await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (!room_id || !check_in || !check_out || !total_price) {
      return NextResponse.json(
        { message: "Thiếu trường bắt buộc" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO bookings (user_id, room_id, check_in, check_out, status, total_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(sql, [
      user.id,
      room_id,
      check_in,
      check_out,
      status || "pending", // default status = pending
      total_price,
    ]);

    return NextResponse.json({ message: "Đặt phòng thành công", result });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// Lấy tất cả bookings
export async function GET() {
  console.log(1,'1');
  try {
    const [bookings] = await db.query(`
      SELECT b.*, r.name AS room_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings error:", error.message, error.stack);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
