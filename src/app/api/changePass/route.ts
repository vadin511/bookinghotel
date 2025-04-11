import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordChangeEmail } from '@/app/utils/mailer'; // Hàm gửi mail
import db from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/app/utils/otp';
const OTP_SECRET  = process.env.OTP_SECRET_ENV!;
export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

  const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
    }
    
    // (2) Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result]: any = await db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );

    await sendPasswordChangeEmail(email)

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật và đã gửi thông báo qua email' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
