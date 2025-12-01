import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

// Tạo review mới
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { booking_id, room_id, rating, comment } = await req.json();

    // Validate input
    if (!booking_id || !room_id || !rating) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc (booking_id, room_id, rating)" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Đánh giá phải từ 1 đến 5 sao" },
        { status: 400 }
      );
    }

    // Kiểm tra booking có tồn tại và thuộc về user này không
    const [bookingCheck] = await db.query(
      `SELECT id, user_id, status, hotel_id 
       FROM bookings 
       WHERE id = ? AND user_id = ?`,
      [booking_id, user.id]
    );

    if (bookingCheck.length === 0) {
      return NextResponse.json(
        { message: "Booking không tồn tại hoặc không thuộc về bạn" },
        { status: 404 }
      );
    }

    // Kiểm tra booking đã completed chưa
    if (bookingCheck[0].status !== "completed") {
      return NextResponse.json(
        { message: "Chỉ có thể đánh giá phòng sau khi booking đã hoàn thành" },
        { status: 400 }
      );
    }

    // Kiểm tra room có trong booking này không và lấy hotel_id
    const [roomCheck] = await db.query(
      `SELECT bd.room_id, r.hotel_id 
       FROM booking_details bd
       JOIN rooms r ON bd.room_id = r.id
       WHERE bd.booking_id = ? AND bd.room_id = ?`,
      [booking_id, room_id]
    );

    if (roomCheck.length === 0) {
      return NextResponse.json(
        { message: "Phòng này không có trong booking này" },
        { status: 400 }
      );
    }

    const hotel_id = roomCheck[0].hotel_id || bookingCheck[0].hotel_id;

    // Kiểm tra đã đánh giá chưa (dùng hotel_id và user_id để kiểm tra unique)
    const [existingReview] = await db.query(
      `SELECT id 
       FROM reviews 
       WHERE hotel_id = ? AND user_id = ?`,
      [hotel_id, user.id]
    );

    if (existingReview.length > 0) {
      // Không cho phép chỉnh sửa đánh giá đã có
      return NextResponse.json(
        { message: "Bạn đã đánh giá khách sạn này rồi. Không thể chỉnh sửa đánh giá." },
        { status: 400 }
      );
    }

    // Tạo review mới
    const [result] = await db.query(
      `INSERT INTO reviews (hotel_id, user_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [hotel_id, user.id, rating, comment || null]
    );

    return NextResponse.json({
      message: "Đánh giá thành công",
      review_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Lỗi server", error: error.message },
      { status: 500 }
    );
  }
}

// Lấy danh sách reviews
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotel_id = searchParams.get("hotel_id");
    const user_id = searchParams.get("user_id");

    let query = `
      SELECT r.*, 
             u.name AS user_name, 
             u.avatar AS user_avatar,
             h.name AS hotel_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (hotel_id) {
      query += ` AND r.hotel_id = ?`;
      params.push(hotel_id);
    }

    if (user_id) {
      query += ` AND r.user_id = ?`;
      params.push(user_id);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [reviews] = await db.query(query, params);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Lỗi server", error: error.message },
      { status: 500 }
    );
  }
}

