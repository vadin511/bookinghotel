import { NextResponse } from 'next/server';
export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công' });

  // Xóa access token
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 0,
  });

  // Xóa refresh token
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 0,
  });

  return response;
}
