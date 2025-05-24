import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { verifyOTP } from "../../utils/otp";

const OTP_SECRET = process.env.OTP_SECRET_ENV;

export async function POST(req) {
  try {
    const { otp } = await req.json();
    const isValid = verifyOTP(otp, OTP_SECRET);

    if (!isValid) {
      return NextResponse.json(
        { message: "OTP không hợp lệ" },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const tempUser = cookieStore.get("temp_user")?.value;

    if (!tempUser) {
      return NextResponse.json(
        { message: "Không tìm thấy thông tin người dùng tạm thời" },
        { status: 400 }
      );
    }

    const { full_name, email, password } = JSON.parse(tempUser);

    // Giá trị mặc định
    const avatar_url = null;
    const role_id = "user";
    const created_at = new Date();
    const updated_at = null;

    const query = `
      INSERT INTO users 
      (full_name, email, password, avatar_url, role_id, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      full_name,
      email,
      password,
      avatar_url,
      role_id,
      created_at,
      updated_at,
    ];

    await db.query(query, values);

    const res = NextResponse.json({
      message: "Xác thực thành công và đã đăng ký",
      success: true,
    });
    res.cookies.set("temp_user", "", { maxAge: 0 });

    return res;
  } catch (err) {
    console.error("Lỗi xác thực OTP:", err);
    return NextResponse.json(
      { message: "Lỗi xác thực", error: err.message },
      { status: 500 }
    );
  }
}
