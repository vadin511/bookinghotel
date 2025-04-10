// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/app/utils/otp';
import { sendOTPEmail } from '@/app/utils/mailer';
const OTP_SECRET  = process.env.OTP_SECRET_ENV!;
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const otp = generateOTP(OTP_SECRET);
    await sendOTPEmail(email, otp);


    const hashedPassword = await bcrypt.hash(password, 10);
console.log(1);

    const res = NextResponse.json({ message: 'OTP sent', step: 'otp' });
    res.cookies.set('temp_user', JSON.stringify({ name, email, password: hashedPassword }), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 300, // 5 phút
    });

    return res;
  } catch (error: any) {
    console.error('Lỗi gửi OTP:', error);
    return NextResponse.json({ message: 'Gửi OTP thất bại', error: error.message }, { status: 500 });
  }
}