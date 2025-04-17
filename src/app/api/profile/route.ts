import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import db from '@/app/lib/db';
import { ok } from 'assert';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const cookieStore = cookies();
  
  const token = (await cookieStore).get('token')?.value;
    
  if (!token) {
    
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET) as any;
    console.log(userData);
    
    
    const user =userData

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }
    console.log(2);
    
    return Response.json({ok: true, user}, { status: 200 });
  } catch (error) {
    return Response.json({ message: 'Invalid token' }, { status: 401 });
  }
}
