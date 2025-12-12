// app/api/rooms/[id]/booked-dates/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date"); // Format: YYYY-MM-DD
    const endDate = searchParams.get("end_date"); // Format: YYYY-MM-DD

    // Default: lấy 90 ngày từ hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const defaultStartDate = today.toISOString().split("T")[0];
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 90);
    const defaultEndDateStr = defaultEndDate.toISOString().split("T")[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDateStr;

    // Lấy tất cả bookings của phòng trong khoảng thời gian
    const [bookings] = await db.query(`
      SELECT 
        b.check_in,
        b.check_out,
        b.status
      FROM booking_details bd
      JOIN bookings b ON bd.booking_id = b.id
      WHERE bd.room_id = ?
        AND b.status IN ('pending', 'confirmed', 'paid')
        AND (
          (b.check_in <= ? AND b.check_out > ?)
          OR (b.check_in >= ? AND b.check_in < ?)
        )
      ORDER BY b.check_in ASC
    `, [id, end, start, start, end]);

    // Tạo Set chứa tất cả các ngày đã được đặt
    const bookedDates = new Set();
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      
      // Thêm tất cả các ngày trong khoảng check_in đến check_out (không bao gồm check_out)
      let currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (dateStr >= start && dateStr <= end) {
          bookedDates.add(dateStr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return NextResponse.json({
      room_id: parseInt(id),
      start_date: start,
      end_date: end,
      booked_dates: Array.from(bookedDates).sort(),
    });
  } catch (error) {
    console.error("GET /api/rooms/[id]/booked-dates error:", error);
    return NextResponse.json(
      { 
        message: "Lỗi khi lấy danh sách ngày đã đặt",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
