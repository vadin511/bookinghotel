// app/api/rooms/[id]/route.js
import { getUserFromToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req, context) {
  const { id } = context.params;
  try {
    const [rooms] = await db.query(`SELECT * FROM rooms WHERE id = ?`, [id]);
    const room = rooms[0];
    return room
      ? NextResponse.json(room)
      : NextResponse.json({ message: "Không tìm thấy phòng" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/room/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req, context) {
  const { id } = context.params;
  try {
    const user = getUserFromToken(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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

    const sql = `
      UPDATE rooms
      SET name = ?, hotel_id = ?, type_id = ?, max_guests = ?, photos = ?, area_sqm = ?, bed_type = ?, price_per_night = ?, status = ?
      WHERE id = ?
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
      id,
    ]);

    return NextResponse.json({ message: "Cập nhật phòng thành công", result });
  } catch (error) {
    console.error("PUT /api/rooms/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  const { id } = context.params;
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
