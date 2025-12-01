// app/api/rooms/search/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || "";
    const check_in = searchParams.get("check_in") || "";
    const check_out = searchParams.get("check_out") || "";
    const adults = parseInt(searchParams.get("adults")) || 1;

    // Xây dựng query SQL
    let sql = `
      SELECT DISTINCT r.*, 
             h.name AS hotel_name, 
             h.address AS hotel_address
      FROM rooms r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      WHERE r.status = 'available'
    `;

    const params = [];

    // Filter theo location (tìm trong address, location và name của hotel)
    if (location) {
      sql += ` AND (
        h.address LIKE ? 
        OR h.location LIKE ? 
        OR h.name LIKE ?
      )`;
      const locationPattern = `%${location}%`;
      params.push(locationPattern, locationPattern, locationPattern);
    }

    // Filter theo số người (max_people)
    if (adults > 0) {
      sql += ` AND r.max_people >= ?`;
      params.push(adults);
    }

    // Filter theo phòng còn trống trong khoảng thời gian (qua booking_details)
    if (check_in && check_out) {
      sql += ` AND r.id NOT IN (
        SELECT DISTINCT bd.room_id
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.id
        WHERE b.status IN ('pending', 'confirmed', 'paid')
          AND (
            (b.check_in <= ? AND b.check_out > ?)
            OR (b.check_in < ? AND b.check_out >= ?)
            OR (b.check_in >= ? AND b.check_out <= ?)
          )
      )`;
      params.push(
        check_in,
        check_in,
        check_out,
        check_out,
        check_in,
        check_out
      );
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rooms] = await db.query(sql, params);

    // Lấy photos từ bảng room_photos và hotel_photos
    const roomsWithPhotos = await Promise.all(
      rooms.map(async (room) => {
        // Lấy room photos
        const [roomPhotos] = await db.query(
          "SELECT photo_url FROM room_photos WHERE room_id = ?",
          [room.id]
        );
        
        // Lấy hotel photos
        const [hotelPhotos] = await db.query(
          "SELECT photo_url FROM hotel_photos WHERE hotel_id = ?",
          [room.hotel_id]
        );

        return {
          ...room,
          photos: roomPhotos.map(p => p.photo_url),
          hotel_photos: hotelPhotos.map(p => p.photo_url),
        };
      })
    );

    return NextResponse.json(roomsWithPhotos);
  } catch (error) {
    console.error("GET /api/rooms/search error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi tìm kiếm phòng" },
      { status: 500 }
    );
  }
}

