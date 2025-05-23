import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { sendPasswordChangeEmail } from '../../utils/mailer';



export async function POST(req) {
  try {
    const { email, newPassword } = await req.json();

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    await sendPasswordChangeEmail(email);

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật và đã gửi thông báo qua email' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
