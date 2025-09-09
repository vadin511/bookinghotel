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
      type_id,
      max_guests,
      photos,
      area_sqm,
      bed_type,
      price_per_night,
      status,
    } = await req.json();

    if (!name || !hotel_id || !type_id) {
      return NextResponse.json({ message: "Thiếu trường bắt buộc" }, { status: 400 });
    }

    const sql = `
      INSERT INTO rooms (name, hotel_id, type_id, max_guests, photos, area_sqm, bed_type, price_per_night, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      hotel_id,
      type_id,
      max_guests || null,
      JSON.stringify(photos) || null,
      area_sqm || null,
      bed_type || null,
      price_per_night || null,
      status || "available",
    ]);

    return NextResponse.json({ message: "Thêm phòng thành công", result });
  } catch (error) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rooms] = await db.query(`SELECT * FROM rooms`);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
