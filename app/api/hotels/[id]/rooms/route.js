// app/api/hotels/[id]/rooms/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const [rooms] = await db.query(
      "SELECT * FROM rooms WHERE hotel_id = ? ORDER BY created_at DESC",
      [params.id]
    );

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ message: "Lỗi server khi lấy danh sách phòng" }, { status: 500 });
  }
}