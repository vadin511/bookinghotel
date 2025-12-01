// app/api/hotels/[id]/rooms/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    // Sử dụng JOIN để tránh N+1 query problem
    // Ẩn phòng có trạng thái maintenance
    const [roomsWithPhotos] = await db.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id
      WHERE r.hotel_id = ? AND r.status != 'maintenance'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, [params.id]);

    // Xử lý photos từ GROUP_CONCAT thành array và làm tròn giá về số nguyên
    const rooms = roomsWithPhotos.map(room => ({
      ...room,
      photos: room.photos ? room.photos.split(',') : [],
      price_per_night: room.price_per_night ? Math.round(parseFloat(room.price_per_night)) : null,
    }));

    return NextResponse.json(rooms, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ message: "Lỗi server khi lấy danh sách phòng" }, { status: 500 });
  }
}