// app/api/hotels/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

export async function GET(req, { params }) {
  try {
    const [rows] = await db.query("SELECT * FROM hotels WHERE id = ?", [params.id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy khách sạn" }, { status: 404 });
    }
    
    const hotel = {
      ...rows[0],
      photos: rows[0].photos ? JSON.parse(rows[0].photos) : []
    };
    
    return NextResponse.json(hotel);
  } catch (error) {
    console.error("GET /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, address, description, category_id, type_id, photos } = await req.json();

    await db.query(
      `UPDATE hotels 
       SET name = ?, address = ?, description = ?, category_id = ?, type_id = ?, photos = ? 
       WHERE id = ? AND manager_id = ?`,
      [
        name,
        address,
        description || null,
        category_id || null,
        type_id || null,
        JSON.stringify(photos || []),
        params.id,
        user.id,
      ]
    );

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("PUT /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await db.query("DELETE FROM hotels WHERE id = ? AND manager_id = ?", [params.id, user.id]);
    return NextResponse.json({ message: "Xoá khách sạn thành công" });
  } catch (error) {
    console.error("DELETE /api/hotels/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}