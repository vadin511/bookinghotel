import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/app/utils/otp';
import db from '@/app/lib/db';

const OTP_SECRET =process.env.OTP_SECRET_ENV!;

export async function POST(req: NextRequest) {
  try {
    const { otp } = await req.json();
    const isValid = verifyOTP(otp, OTP_SECRET);

    if (!isValid) {
      return NextResponse.json({ message: 'OTP không hợp lệ' }, { status: 401 });
    }

    const tempUser = req.cookies.get('temp_user')?.value;
    console.log(tempUser);
    
    if (!tempUser) {
      return NextResponse.json({ message: 'Không tìm thấy thông tin người dùng tạm thời' }, { status: 400 });
    }

    const { name, email, password } = JSON.parse(tempUser);

    const query = 'INSERT INTO users (name,email,password) VALUES (?,?,?)';
    const values = [name, email, password];
    await db.query(query, values);

    const res = NextResponse.json({ message: 'Xác thực thành công và đã đăng ký', success : true });
    res.cookies.set('temp_user', '', { maxAge: 0 }); 

    return res;
  } catch (err: any) {
    console.error('Lỗi xác thực OTP:', err);
    return NextResponse.json({ message: 'Lỗi xác thực', error: err.message }, { status: 500 });
  }
}
