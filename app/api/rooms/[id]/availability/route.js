// app/api/rooms/[id]/availability/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const check_in = searchParams.get("check_in");
    const check_out = searchParams.get("check_out");

    if (!check_in || !check_out) {
      return NextResponse.json(
        { 
          available: true,
          message: "Vui lòng chọn ngày check-in và check-out để kiểm tra"
        },
        { status: 200 }
      );
    }

    // Kiểm tra phòng có còn trống không (kiểm tra qua booking_details)
    // Logic: Hai khoảng thời gian overlap nếu: (new_check_in < old_check_out) AND (new_check_out > old_check_in)
    const checkAvailabilitySql = `
      SELECT b.id as booking_id,
             b.check_in,
             b.check_out,
             b.status
      FROM booking_details bd
      JOIN bookings b ON bd.booking_id = b.id
      WHERE bd.room_id = ?
        AND b.status IN ('pending', 'confirmed', 'paid')
        AND ? < b.check_out
        AND ? > b.check_in
      LIMIT 1
    `;

    const [availabilityResult] = await db.query(checkAvailabilitySql, [
      id,
      check_in,
      check_out,
    ]);

    const isAvailable = availabilityResult.length === 0;
    const conflictBooking = availabilityResult.length > 0 && availabilityResult[0].booking_id ? {
      booking_id: availabilityResult[0].booking_id,
      check_in: availabilityResult[0].check_in,
      check_out: availabilityResult[0].check_out,
      status: availabilityResult[0].status,
    } : null;

    return NextResponse.json({
      available: isAvailable,
      conflict: conflictBooking,
      message: isAvailable 
        ? "Phòng có sẵn trong khoảng thời gian này"
        : `Phòng đã được khách hàng khác đặt trước, vui lòng chọn ngày khác!`,
    });
  } catch (error) {
    console.error("GET /api/rooms/[id]/availability error:", error);
    return NextResponse.json(
      { 
        available: false,
        message: "Lỗi khi kiểm tra availability",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

