import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra type phải là access token
    if (userData.type && userData.type !== "access") {
      return NextResponse.json({ message: "Invalid token type" }, { status: 401 });
    }

    // Lấy thông tin user từ database
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userData.id,
    ]);

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (user.status === 'blocked') {
      return NextResponse.json(
        { 
          message: "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với tổng đài VadiGo để được sử dụng",
          blocked: true
        }, 
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("JWT verification error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !JWT_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra type phải là access token
    if (userData.type && userData.type !== "access") {
      return NextResponse.json({ message: "Invalid token type" }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, avatar, phone, address, gender } = body;

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Tên không được để trống" },
        { status: 400 }
      );
    }

    // Cập nhật thông tin user
    const sql = `
      UPDATE users 
      SET name = ?, avatar = ?, phone = ?, address = ?, gender = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(sql, [
      name.trim(),
      avatar || null,
      phone || null,
      address || null,
      gender || null,
      userData.id,
    ]);

    // Lấy lại thông tin user đã cập nhật
    const [updatedUsers] = await db.query("SELECT * FROM users WHERE id = ?", [
      userData.id,
    ]);

    return NextResponse.json(
      {
        message: "Cập nhật thông tin thành công",
        user: updatedUsers[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi cập nhật thông tin" },
      { status: 500 }
    );
  }
}
