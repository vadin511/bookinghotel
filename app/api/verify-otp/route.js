import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { verifyOTP } from "../../utils/otp";

const OTP_SECRET = process.env.OTP_SECRET_ENV;

export async function POST(req) {
  try {
    const { otp } = await req.json();
    const isValid = verifyOTP(otp, OTP_SECRET);
    console.log(isValid);
    
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

    const { name, email, password } = JSON.parse(tempUser);

    // Giá trị mặc định
    const avatar = null;
    const role = "user";
    const status = "active";

    const query = `
      INSERT INTO users 
      (name, email, password, avatar, role, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      name,
      email,
      password,
      avatar,
      role,
      status,
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
