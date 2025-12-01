// app/api/hotels/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

export async function GET(req, { params }) {
  try {
    // Sử dụng JOIN để lấy hotel, photos và thông tin đánh giá trong một query
    const [hotels] = await db.query(`
      SELECT 
        h.*,
        GROUP_CONCAT(hp.photo_url ORDER BY hp.id) as photos,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM hotels h
      LEFT JOIN hotel_photos hp ON h.id = hp.hotel_id
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE h.id = ?
      GROUP BY h.id
    `, [params.id]);
    
    if (hotels.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy khách sạn" }, { status: 404 });
    }
    
    const hotel = hotels[0];
    
    return NextResponse.json({
      ...hotel,
      photos: hotel.photos ? hotel.photos.split(',') : [],
      average_rating: hotel.average_rating ? parseFloat(hotel.average_rating).toFixed(1) : '0.0',
      total_reviews: parseInt(hotel.total_reviews) || 0,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, address, description, location, map_url, phone, email, photos } = await req.json();

    await db.query(
      `UPDATE hotels 
       SET name = ?, address = ?, description = ?, location = ?, map_url = ?, phone = ?, email = ? 
       WHERE id = ?`,
      [
        name,
        address,
        description || null,
        location || null,
        map_url || null,
        phone || null,
        email || null,
        params.id,
      ]
    );

    // Cập nhật photos: xóa cũ và thêm mới
    await db.query("DELETE FROM hotel_photos WHERE hotel_id = ?", [params.id]);
    
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const photoValues = photos.map(photo => [params.id, photo]);
      const photoSql = `INSERT INTO hotel_photos (hotel_id, photo_url) VALUES ?`;
      await db.query(photoSql, [photoValues]);
    }

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("PUT /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await db.query("DELETE FROM hotels WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Xoá khách sạn thành công" });
  } catch (error) {
    console.error("DELETE /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}