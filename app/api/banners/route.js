// app/api/banners/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

// GET - Lấy danh sách banners (public, chỉ lấy banners đang active)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    let sql = `
      SELECT * FROM banners
    `;
    
    if (!includeInactive) {
      sql += ` WHERE is_active = 1`;
    }
    
    sql += ` ORDER BY created_at DESC`;

    const [banners] = await db.query(sql);

    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/banners error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST - Tạo banner mới (chỉ admin)
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, image_url, link, is_active } = await req.json();

    if (!image_url) {
      return NextResponse.json({ message: "URL ảnh là bắt buộc" }, { status: 400 });
    }

    const sql = `
      INSERT INTO banners (title, image_url, link, is_active)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      title || null,
      image_url,
      link || null,
      is_active !== undefined ? is_active : 1,
    ]);

    const [newBanner] = await db.query("SELECT * FROM banners WHERE id = ?", [result.insertId]);

    return NextResponse.json({ 
      message: "Thêm banner thành công", 
      result: newBanner[0] 
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

