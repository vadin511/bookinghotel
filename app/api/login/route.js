import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import db from "../../lib/db";

const jwtKey = process.env.JWT_SECRET;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Sử dụng redis để lưu trữ
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"),
  analytics: true,
});

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { email, password } = await req.json();
  console.log(ip);

  const { success } = await ratelimit.limit(ip);
  console.log(success);

  if (!success) {
    return NextResponse.json(
      {
        message: "Too many login attempts. Please try again later.",
      },
      { status: 429 }
    );
  }

  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];

  // Kiểm tra user có tồn tại và mật khẩu đúng không
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json(
      { message: "Sai tài khoản hoặc mật khẩu", access: false },
      { status: 401 }
    );
  }

  // Kiểm tra tài khoản có bị vô hiệu hóa không
  if (user.status === 'blocked') {
    return NextResponse.json(
      { 
        message: "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với tổng đài VadiGo để được sử dụng", 
        access: false 
      },
      { status: 403 }
    );
  }

  // Tạo access token (7 ngày)
  const accessToken = jwt.sign(
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

  // Tạo refresh token (30 ngày)
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: "refresh",
    },
    jwtKey,
    { expiresIn: "30d" }
  );

  const response = new NextResponse(
  JSON.stringify({
    message: "Đăng nhập thành công",
    access: true,
      role: user.role,
  }),
  {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  }
);

// Set access token cookie (7 ngày)
response.cookies.set("token", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 ngày
});

// Set refresh token cookie (30 ngày)
response.cookies.set("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 ngày
});

return response;
}
