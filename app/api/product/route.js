import { NextResponse } from 'next/server';
import db from '../../lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, price, description, user_id } = await req.json();
    console.log("user_id", user_id);

    if (!name || !price || !description) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO products (name, price, description, user_id) VALUES (?, ?, ?, ?)',
      [name, price, description, user_id]
    );

    return NextResponse.json({ message: 'Product created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
  }
}
