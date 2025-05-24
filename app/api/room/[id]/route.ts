// app/api/rooms/[id]/route.ts
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const [rooms] = await db.query(`SELECT * FROM rooms WHERE id = ?`, [params.id]);
    const room = rooms[0];
    return room
      ? NextResponse.json(room)
      : NextResponse.json({ message: "Không tìm thấy phòng" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/rooms/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
      params.id,
    ]);

    return NextResponse.json({ message: "Cập nhật phòng thành công", result });
  } catch (error) {
    console.error("PUT /api/rooms/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const sql = `DELETE FROM rooms WHERE id = ?`;
    const [result] = await db.query(sql, [params.id]);

    return NextResponse.json({ message: "Xoá phòng thành công", result });
  } catch (error) {
    console.error("DELETE /api/rooms/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}