// app/api/refresh/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

const jwtKey = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token không tồn tại" },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtKey);
    } catch (err) {
      return NextResponse.json(
        { message: "Refresh token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Kiểm tra type phải là refresh token
    if (decoded.type !== "refresh") {
      return NextResponse.json(
        { message: "Token không hợp lệ" },
        { status: 401 }
      );
    }

    // Lấy thông tin user từ database
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (user.status === "blocked") {
      return NextResponse.json(
        {
          message:
            "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với tổng đài VadiGo để được sử dụng",
        },
        { status: 403 }
      );
    }

    // Tạo access token mới (7 ngày)
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        type: "access",
      },
      jwtKey,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Token đã được làm mới thành công",
      access: true,
    });

    // Set access token cookie mới (7 ngày)
    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error("POST /api/refresh error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi server khi làm mới token" },
      { status: 500 }
    );
  }
}














