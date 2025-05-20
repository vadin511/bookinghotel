// app/api/hotels/[id]/route.ts
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await db.query("SELECT * FROM hotels WHERE id = ?", [params.id]);
  const rows = result[0] as any[]; // 👈 khai báo rõ kiểu

  if (rows.length === 0) {
    return NextResponse.json({ message: "Không tìm thấy khách sạn" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, address, description, category_id, type_id } = await req.json();
  await db.query(
    `UPDATE hotels SET name = ?, address = ?, description = ?, category_id = ?, type_id = ? WHERE id = ? AND manager_id = ?`,
    [name, address, description || null, category_id || null, type_id || null, params.id, user.id]
  );
  return NextResponse.json({ message: "Cập nhật thành công" });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await db.query("DELETE FROM hotels WHERE id = ? AND manager_id = ?", [params.id, user.id]);
  return NextResponse.json({ message: "Xoá khách sạn thành công" });
}
