// app/api/posts/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

export async function GET(req, { params }) {
  try {
    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let id = params?.id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    }
    
    const [posts] = await db.query(
      `SELECT * FROM posts WHERE id = ?`,
      [id]
    );
    
    if (posts.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy bài viết" }, { status: 404 });
    }
    
    return NextResponse.json(posts[0], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Xử lý params
    let id = params?.id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    }

    const { title, content, image, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "Tiêu đề và nội dung là bắt buộc" }, { status: 400 });
    }

    await db.query(
      `UPDATE posts 
       SET title = ?, content = ?, image = ?, category = ?
       WHERE id = ?`,
      [
        title,
        content,
        image || null,
        category || null,
        id,
      ]
    );

    return NextResponse.json({ message: "Cập nhật bài viết thành công" });
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Xử lý params
    let id = params?.id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    }

    await db.query("DELETE FROM posts WHERE id = ?", [id]);
    return NextResponse.json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

