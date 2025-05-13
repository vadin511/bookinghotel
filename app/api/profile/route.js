import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    console.log(userData);

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: userData }, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
