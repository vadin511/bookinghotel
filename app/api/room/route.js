// app/api/rooms/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      hotel_id,
      room_type_id,
      max_people,
      photos,
      area_sqm,
      bed_type,
      price_per_night,
      status,
    } = await req.json();

    if (!name || !hotel_id) {
      return NextResponse.json({ message: "Thiếu trường bắt buộc" }, { status: 400 });
    }

    // Validate và xử lý room_type_id
    let validRoomTypeId = null;
    if (room_type_id) {
      // Nếu là số, kiểm tra trực tiếp
      const roomTypeIdNum = parseInt(room_type_id);
      if (!isNaN(roomTypeIdNum) && roomTypeIdNum > 0) {
        try {
          const [roomTypeCheck] = await db.query(
            "SELECT id FROM room_types WHERE id = ?",
            [roomTypeIdNum]
          );
          if (roomTypeCheck.length > 0) {
            validRoomTypeId = roomTypeIdNum;
          } else {
            console.warn(`room_type_id ${roomTypeIdNum} không tồn tại trong bảng room_types, sẽ set thành null`);
          }
        } catch (checkError) {
          console.warn("Lỗi khi kiểm tra room_type_id:", checkError);
        }
      } else {
        // Nếu là string (tên loại phòng), tìm ID từ bảng room_types
        try {
          const [roomTypeByName] = await db.query(
            "SELECT id FROM room_types WHERE LOWER(name) = LOWER(?)",
            [room_type_id]
          );
          if (roomTypeByName.length > 0) {
            validRoomTypeId = roomTypeByName[0].id;
          } else {
            // Tự động tạo loại phòng mới nếu chưa có
            try {
              const [insertResult] = await db.query(
                "INSERT INTO room_types (name) VALUES (?)",
                [room_type_id]
              );
              validRoomTypeId = insertResult.insertId;
              console.log(`Đã tạo loại phòng mới: ${room_type_id} với ID: ${validRoomTypeId}`);
            } catch (insertError) {
              console.warn("Lỗi khi tạo loại phòng mới:", insertError);
            }
          }
        } catch (checkError) {
          console.warn("Lỗi khi tìm room_type_id theo tên:", checkError);
        }
      }
    }

    const sql = `
      INSERT INTO rooms (name, hotel_id, room_type_id, max_people, area_sqm, bed_type, price_per_night, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Làm tròn price_per_night về số nguyên nếu có
    const roundedPrice = price_per_night ? Math.round(parseFloat(price_per_night)) : null;

    const [result] = await db.query(sql, [
      name,
      hotel_id,
      validRoomTypeId,
      max_people || null,
      area_sqm || null,
      bed_type || null,
      roundedPrice,
      status || "available",
    ]);

    const roomId = result.insertId;

    // Lưu photos vào bảng room_photos
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const photoValues = photos.map(photo => [roomId, photo]);
      const photoSql = `INSERT INTO room_photos (room_id, photo_url) VALUES ?`;
      await db.query(photoSql, [photoValues]);
    }

    // Lấy lại dữ liệu phòng vừa tạo để trả về
    const [newRooms] = await db.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [roomId]);

    const newRoom = newRooms[0];
    if (newRoom) {
      return NextResponse.json({
        ...newRoom,
        photos: newRoom.photos ? newRoom.photos.split(',') : [],
        price_per_night: newRoom.price_per_night ? Math.round(parseFloat(newRoom.price_per_night)) : null,
      });
    }

    return NextResponse.json({ message: "Thêm phòng thành công", result });
  } catch (error) {
    console.error("POST /api/rooms error:", error);
    
    // Trả về thông báo lỗi chi tiết hơn cho foreign key constraint
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.sqlMessage?.includes('room_type_id')) {
        return NextResponse.json({ 
          message: "Loại phòng không hợp lệ. Vui lòng chọn loại phòng hợp lệ hoặc để trống." 
        }, { status: 400 });
      }
      if (error.sqlMessage?.includes('hotel_id')) {
        return NextResponse.json({ 
          message: "Khách sạn không hợp lệ. Vui lòng chọn khách sạn hợp lệ." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    // Kiểm tra nếu user là admin thì trả về tất cả phòng (kể cả maintenance)
    const user = getUserFromToken(req);
    const isAdmin = user && user.role === "admin";
    
    // Sử dụng JOIN để tránh N+1 query problem
    // Admin: hiển thị tất cả phòng, User thường: ẩn phòng có trạng thái maintenance
    const whereClause = isAdmin ? "" : "WHERE r.status != 'maintenance'";
    
    const [roomsWithPhotos] = await db.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id
      ${whereClause}
      GROUP BY r.id
    `);
    
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
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
