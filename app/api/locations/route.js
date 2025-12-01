// app/api/locations/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET() {
  try {
    // Lấy danh sách locations với số lượng khách sạn
    const [locations] = await db.query(`
      SELECT 
        h.location,
        COUNT(DISTINCT h.id) as hotel_count
      FROM hotels h
      INNER JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.status = 'active' 
        AND rm.status = 'available'
        AND h.location IS NOT NULL 
        AND h.location != ''
      GROUP BY h.location
      HAVING hotel_count > 0
      ORDER BY hotel_count DESC, h.location ASC
    `);

    // Lấy ảnh cho mỗi location (ảnh đầu tiên của khách sạn đầu tiên)
    const locationsWithImages = await Promise.all(
      locations.map(async (loc) => {
        const [hotels] = await db.query(`
          SELECT h.id
          FROM hotels h
          INNER JOIN rooms rm ON h.id = rm.hotel_id
          WHERE h.location = ? 
            AND h.status = 'active' 
            AND rm.status = 'available'
          ORDER BY h.id ASC
          LIMIT 1
        `, [loc.location]);

        let image = null;
        if (hotels.length > 0) {
          const [photos] = await db.query(`
            SELECT photo_url 
            FROM hotel_photos 
            WHERE hotel_id = ? 
            ORDER BY id ASC 
            LIMIT 1
          `, [hotels[0].id]);
          if (photos.length > 0) {
            image = photos[0].photo_url;
          }
        }
        return { ...loc, image };
      })
    );

    // Ảnh mặc định từ Unsplash
    const defaultImages = [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    ];

    // Xử lý dữ liệu và thêm ảnh mặc định nếu không có
    const destinations = locationsWithImages.map((loc, index) => ({
      id: index + 1,
      name: loc.location,
      image: loc.image || defaultImages[index % defaultImages.length],
      hotelCount: loc.hotel_count,
    }));

    return NextResponse.json(destinations, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("GET /api/locations error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi lấy danh sách địa điểm" },
      { status: 500 }
    );
  }
}

