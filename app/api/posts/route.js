// app/api/posts/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

export async function GET() {
  try {
    const [posts] = await db.query(`
      SELECT * FROM posts 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, image, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "Tiêu đề và nội dung là bắt buộc" }, { status: 400 });
    }

    const sql = `
      INSERT INTO posts (title, content, image, category)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      title,
      content,
      image || null,
      category || null,
    ]);

    const postId = result.insertId;

    // Lấy lại dữ liệu bài viết vừa tạo để trả về
    const [newPosts] = await db.query("SELECT * FROM posts WHERE id = ?", [postId]);
    
    if (newPosts.length > 0) {
      return NextResponse.json(newPosts[0]);
    }

    return NextResponse.json({ 
      message: "Thêm bài viết thành công", 
      id: postId 
    });
  } catch (error) {
    console.error("Error adding post:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}




