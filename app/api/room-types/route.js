// app/api/room-types/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET() {
  try {
    const [roomTypes] = await db.query(
      "SELECT * FROM room_types ORDER BY name"
    );
    return NextResponse.json(roomTypes);
  } catch (error) {
    console.error("GET /api/room-types error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi lấy danh sách loại phòng" },
      { status: 500 }
    );
  }
}












