// app/api/rooms/[id]/route.js
import { getUserFromToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req, context) {
  const { id } = await context.params;
  try {
    // Sử dụng JOIN để lấy room, photos và hotel info (bao gồm map_url) trong một query
    // Ẩn phòng có trạng thái maintenance
    const [rooms] = await db.query(`
      SELECT 
        r.*,
        h.id as hotel_id,
        h.name as hotel_name,
        h.address as hotel_address,
        h.location as hotel_location,
        h.map_url as hotel_map_url,
        GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
      FROM rooms r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN room_photos rp ON r.id = rp.room_id
      WHERE r.id = ? AND r.status != 'maintenance'
      GROUP BY r.id
    `, [id]);
    
    if (rooms.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy phòng" }, { status: 404 });
    }
    
    const room = rooms[0];
    
    return NextResponse.json({
      ...room,
      photos: room.photos ? room.photos.split(',') : [],
      map_url: room.hotel_map_url,
      price_per_night: room.price_per_night ? Math.round(parseFloat(room.price_per_night)) : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/room/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req, context) {
  const { id } = await context.params;
  try {
    const user = getUserFromToken(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
      UPDATE rooms
      SET name = ?, hotel_id = ?, room_type_id = ?, max_people = ?, area_sqm = ?, bed_type = ?, price_per_night = ?, status = ?
      WHERE id = ?
    `;

    // Làm tròn price_per_night về số nguyên nếu có
    const roundedPrice = price_per_night ? Math.round(parseFloat(price_per_night)) : null;

    await db.query(sql, [
      name,
      hotel_id,
      validRoomTypeId,
      max_people || null,
      area_sqm || null,
      bed_type || null,
      roundedPrice,
      status || "available",
      id,
    ]);

    // Cập nhật photos: xóa cũ và thêm mới
    await db.query("DELETE FROM room_photos WHERE room_id = ?", [id]);
    
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const photoValues = photos.map(photo => [id, photo]);
      const photoSql = `INSERT INTO room_photos (room_id, photo_url) VALUES ?`;
      await db.query(photoSql, [photoValues]);
    }

    // Lấy lại dữ liệu phòng đã cập nhật để trả về
    const [updatedRooms] = await db.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
      FROM rooms r
      LEFT JOIN room_photos rp ON r.id = rp.room_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);

    const updatedRoom = updatedRooms[0];
    if (updatedRoom) {
      return NextResponse.json({
        ...updatedRoom,
        photos: updatedRoom.photos ? updatedRoom.photos.split(',') : [],
        price_per_night: updatedRoom.price_per_night ? Math.round(parseFloat(updatedRoom.price_per_night)) : null,
      });
    }

    return NextResponse.json({ message: "Cập nhật phòng thành công" });
  } catch (error) {
    console.error("PUT /api/room/[id] error:", error);
    
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

export async function DELETE(req, context) {
  const { id } = await context.params;
  try {
    const user = getUserFromToken(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const sql = `DELETE FROM rooms WHERE id = ?`;
    const [result] = await db.query(sql, [id]);

    return NextResponse.json({ message: "Xoá phòng thành công", result });
  } catch (error) {
    console.error("DELETE /api/rooms/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
