// app/api/hotels/route.ts
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromToken } from "../../lib/auth"; // 👈 import hàm lấy user từ token
import { UserPayload } from "../../type/user"; // 👈 import kiểu user


export async function GET() {
  const [rows] = await db.query("SELECT * FROM hotels");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const user: UserPayload | null = getUserFromToken(req); // 👈 gán kiểu rõ ràng
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, address, description, category_id, type_id } = await req.json();

    if (!name || !address) {
      return NextResponse.json({ message: "Tên và địa chỉ là bắt buộc" }, { status: 400 });
    }

    const sql = `
      INSERT INTO hotels (name, address, description, manager_id, category_id, type_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      address,
      description || null,
      user.id,
      category_id || null,
      type_id || null,
    ]);

    return NextResponse.json({ message: "Thêm khách sạn thành công", result });
  } catch (error) {
    console.error("Error adding hotel:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
