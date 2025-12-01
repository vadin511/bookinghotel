// app/api/hotel/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

export async function GET() {
  try {
    // Kiểm tra kết nối database
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error("Database environment variables are missing");
      return NextResponse.json(
        { 
          message: "Lỗi cấu hình database",
          error: "Missing database environment variables"
        }, 
        { status: 500 }
      );
    }

    // Sử dụng JOIN để tránh N+1 query problem, bao gồm thông tin đánh giá và giá phòng
    // Sử dụng GROUP_CONCAT với SEPARATOR để tránh lỗi
    const [hotelsWithPhotos] = await db.query(`
      SELECT 
        h.*,
        GROUP_CONCAT(DISTINCT hp.photo_url ORDER BY hp.id SEPARATOR ',') as photos,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        MIN(rm.price_per_night) as min_price_per_night
      FROM hotels h
      LEFT JOIN hotel_photos hp ON h.id = hp.hotel_id
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN rooms rm ON h.id = rm.hotel_id AND rm.status = 'available'
      WHERE h.status = 'active'
      GROUP BY h.id
    `);
    
    // Xử lý photos từ GROUP_CONCAT thành array và làm tròn số sao
    const hotels = hotelsWithPhotos.map(hotel => ({
      ...hotel,
      photos: hotel.photos ? hotel.photos.split(',').filter(p => p) : [],
      average_rating: hotel.average_rating ? parseFloat(hotel.average_rating).toFixed(1) : '0.0',
      total_reviews: parseInt(hotel.total_reviews) || 0,
      min_price_per_night: hotel.min_price_per_night ? parseFloat(hotel.min_price_per_night) : null,
    }));
    
    return NextResponse.json(hotels, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/hotel error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    // Trả về thông tin lỗi chi tiết hơn (chỉ trong development)
    const errorResponse = {
      message: "Lỗi server",
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        code: error.code
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, address, description, location, map_url, phone, email, photos } = await req.json();

    if (!name || !address) {
      return NextResponse.json({ message: "Tên và địa chỉ là bắt buộc" }, { status: 400 });
    }

    const sql = `
      INSERT INTO hotels (name, address, description, location, map_url, phone, email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const [result] = await db.query(sql, [
      name,
      address,
      description || null,
      location || null,
      map_url || null,
      phone || null,
      email || null,
    ]);

    const hotelId = result.insertId;

    // Lưu photos vào bảng hotel_photos
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const photoValues = photos.map(photo => [hotelId, photo]);
      const photoSql = `INSERT INTO hotel_photos (hotel_id, photo_url) VALUES ?`;
      await db.query(photoSql, [photoValues]);
    }

    // Lấy lại dữ liệu khách sạn vừa tạo để trả về
    const [newHotels] = await db.query(`
      SELECT 
        h.*,
        GROUP_CONCAT(hp.photo_url ORDER BY hp.id) as photos
      FROM hotels h
      LEFT JOIN hotel_photos hp ON h.id = hp.hotel_id
      WHERE h.id = ?
      GROUP BY h.id
    `, [hotelId]);

    const newHotel = newHotels[0];
    if (newHotel) {
      return NextResponse.json({
        ...newHotel,
        photos: newHotel.photos ? newHotel.photos.split(',') : [],
      });
    }

    return NextResponse.json({ message: "Thêm khách sạn thành công", result });
  } catch (error) {
    console.error("Error adding hotel:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}