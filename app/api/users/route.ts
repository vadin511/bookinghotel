/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/users/route.ts
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import db from '../../lib/db';
import { UserRegisterPayload } from '../../model/user';
import { sendOTPEmail } from '../../utils/mailer'; // Hàm gửi mail
import { generateOTP } from '../../utils/otp'; // Hàm tạo OTP
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
    const { name, email, password } = await req.json() as UserRegisterPayload;
    if (!name || !email || !password) {
      console.log(1);
      
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const otp = generateOTP(OTP_SECRET);
    await sendOTPEmail(email, otp);


    const hashedPassword = await bcrypt.hash(password, 10);

    const res = NextResponse.json({ message: 'OTP sent', step: 'otp' });
    res.cookies.set('temp_user', JSON.stringify({ name, email, password: hashedPassword }), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 300, 
    });

    return res;
  } catch (error: any) {
    console.error('Lỗi gửi OTP:', error);
    return NextResponse.json({ message: 'Gửi OTP thất bại', error: error.message }, { status: 500 });
  }
}