import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { sendOTPEmail } from '../../utils/mailer';
import { generateOTP } from '../../utils/otp';

const OTP_SECRET = process.env.OTP_SECRET_ENV;

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, skipOTP } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    // ✅ Kiểm tra email đã tồn tại chưa
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'Email đã tồn tại. Vui lòng đăng nhập hoặc dùng email khác.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Nếu skipOTP = true (admin tạo user), tạo user trực tiếp
    if (skipOTP) {
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name, email, hashedPassword, body.role || 'user']
      );

      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      const user = newUser[0];
      delete user.password;

      return NextResponse.json({ 
        message: 'Tạo người dùng thành công', 
        user 
      });
    }

    // ✅ Nếu không skip OTP (đăng ký thông thường), tạo OTP và gửi email
    const otp = generateOTP(OTP_SECRET);
    await sendOTPEmail(email, otp);

    const res = NextResponse.json({ message: 'Đã gửi mã OTP. Vui lòng kiểm tra email.', step: 'otp' });
    res.cookies.set('temp_user', JSON.stringify({ name, email, password: hashedPassword }), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 300, // 5 phút
    });

    return res;
  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký và gửi OTP:', error);
    return NextResponse.json({ message: 'Lỗi gửi OTP', error: error.message }, { status: 500 });
  }
}
