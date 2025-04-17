import db from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
      const [rows] = await db.query('SELECT * FROM products');
      return NextResponse.json(rows);
    } catch (error) {
      return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
    }
  }

export async function POST(req: NextRequest) {
    try {
      const { name, price, description } = await req.json();
      console.log(name  , price , description);
      
      if (!name || !price || !description) {
        return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
      }
  
      const [result] = await db.query('INSERT INTO products (name, price, description) VALUES (?, ?, ?)', [name, price, description]);
  
      return NextResponse.json({ message: 'Product created'}, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: 'DB query error', error }, { status: 500 });
    }
  }