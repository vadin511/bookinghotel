// app/api/hotel/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

export async function GET() {
  try {
    const [hotels] = await db.query("SELECT * FROM hotels");
    
    // Safely handle photos field
    const hotelsWithParsedPhotos = hotels.map(hotel => {
      let photos = [];
      try {
        if (hotel.photos) {
          // Check if photos is already an array (might be stringified or not)
          if (typeof hotel.photos === 'string') {
            photos = JSON.parse(hotel.photos);
          } else if (Array.isArray(hotel.photos)) {
            photos = hotel.photos;
          }
        }
      } catch (e) {
        console.error("Error parsing photos:", e);
        photos = [];
      }
      
      return {
        ...hotel,
        photos: photos
      };
    });
    
    return NextResponse.json(hotelsWithParsedPhotos);
  } catch (error) {
    console.error("GET /api/hotel error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, address, description, category_id, type_id, photos } = await req.json();

    if (!name || !address) {
      return NextResponse.json({ message: "Tên và địa chỉ là bắt buộc" }, { status: 400 });
    }

    // Ensure photos is always an array
    const photosArray = Array.isArray(photos) ? photos : [];
    
    const sql = `
      INSERT INTO hotels (name, address, description, manager_id, category_id, type_id, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      address,
      description || null,
      user.id,
      category_id || null,
      type_id || null,
      JSON.stringify(photosArray), // Always stringify the array
    ]);

    return NextResponse.json({ message: "Thêm khách sạn thành công", result });
  } catch (error) {
    console.error("Error adding hotel:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}