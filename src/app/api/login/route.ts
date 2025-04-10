import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/app/utils/otp';
import { sendOTPEmail } from '@/app/utils/mailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import db from '@/app/lib/db';
import jwt from 'jsonwebtoken'

const jwtKey = process.env.JWT_SECRET!
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '1 m'),
  analytics: true,
});
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { email, password } = await req.json();
  console.log(ip);
  
  const { success, remaining, reset } = await ratelimit.limit(ip);
  console.log(success);
  
  if (!success) {
    return NextResponse.json({
      message: 'Too many login attempts. Please try again later.',
    }, { status: 429 });
  }

    
  const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json({ message: 'Sai tài khoản hoặc mật khẩu',access : false}, { status: 401 });
  }
  if(user){
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtKey,
      { expiresIn: '1h' } 
    );
  const response = NextResponse.json({ message: 'Đăng nhập thành công',access : true });
  
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    path: '/',
    maxAge: 60 * 60,
  });
return response
  }
}
