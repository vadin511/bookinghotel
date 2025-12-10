// app/api/hotels/[id]/available-rooms/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let hotelId;
    try {
      if (params && typeof params.then === 'function') {
        const resolvedParams = await params;
        hotelId = resolvedParams?.id;
      } else {
        hotelId = params?.id;
      }
      
      if (!hotelId) {
        return NextResponse.json(
          { message: "Thiếu ID khách sạn" },
          { status: 400 }
        );
      }
    } catch (paramError) {
      console.error("Error resolving params:", paramError);
      return NextResponse.json(
        { message: "Lỗi xử lý tham số", error: paramError.message },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const check_in = searchParams.get("check_in");
    const check_out = searchParams.get("check_out");

    // Kiểm tra khách sạn có tồn tại không
    const [hotels] = await db.query(
      "SELECT id, name FROM hotels WHERE id = ?",
      [hotelId]
    );

    if (hotels.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy khách sạn" },
        { status: 404 }
      );
    }

    // Nếu có check_in và check_out, đếm phòng trống trong khoảng thời gian đó
    if (check_in && check_out) {
      // Đếm phòng trống: phòng có status = 'available' và không bị đặt trong khoảng thời gian
      // Logic overlap: Hai khoảng thời gian overlap nếu: (new_check_in < old_check_out) AND (new_check_out > old_check_in)
      const [availableRooms] = await db.query(`
        SELECT COUNT(DISTINCT r.id) as available_count
        FROM rooms r
        WHERE r.hotel_id = ?
          AND r.status = 'available'
          AND r.id NOT IN (
            SELECT DISTINCT bd.room_id
            FROM booking_details bd
            JOIN bookings b ON bd.booking_id = b.id
            WHERE b.status IN ('pending', 'confirmed', 'paid')
              AND ? < b.check_out
              AND ? > b.check_in
          )
      `, [
        hotelId,
        check_in,   // new_check_in < old_check_out
        check_out   // new_check_out > old_check_in
      ]);

      // Đếm tổng số phòng available của khách sạn
      const [totalRooms] = await db.query(`
        SELECT COUNT(*) as total_count
        FROM rooms
        WHERE hotel_id = ? AND status = 'available'
      `, [hotelId]);

      const availableCount = availableRooms[0]?.available_count || 0;
      const totalCount = totalRooms[0]?.total_count || 0;
      const occupiedCount = totalCount - availableCount;

      return NextResponse.json({
        hotel_id: parseInt(hotelId),
        hotel_name: hotels[0].name,
        check_in: check_in,
        check_out: check_out,
        total_rooms: totalCount,
        available_rooms: availableCount,
        occupied_rooms: occupiedCount,
        message: `Có ${availableCount} phòng trống trong khoảng thời gian từ ${check_in} đến ${check_out}`
      });
    } else {
      // Nếu không có check_in/check_out, chỉ đếm tổng số phòng available
      const [totalRooms] = await db.query(`
        SELECT COUNT(*) as total_count
        FROM rooms
        WHERE hotel_id = ? AND status = 'available'
      `, [hotelId]);

      const totalCount = totalRooms[0]?.total_count || 0;

      return NextResponse.json({
        hotel_id: parseInt(hotelId),
        hotel_name: hotels[0].name,
        total_rooms: totalCount,
        available_rooms: totalCount,
        message: `Tổng số phòng trống: ${totalCount} (không tính theo khoảng thời gian)`,
        note: "Để đếm phòng trống trong khoảng thời gian cụ thể, vui lòng cung cấp tham số check_in và check_out"
      });
    }
  } catch (error) {
    console.error("GET /api/hotels/[id]/available-rooms error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        message: "Lỗi server khi đếm số phòng trống",
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

