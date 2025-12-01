// app/api/banners/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

// GET - Lấy banner theo ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const [banners] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);

    if (banners.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy banner" }, { status: 404 });
    }

    return NextResponse.json(banners[0]);
  } catch (error) {
    console.error("GET /api/banners/[id] error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT - Cập nhật banner (chỉ admin)
export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { title, image_url, link, is_active } = await req.json();

    // Kiểm tra banner có tồn tại không
    const [existing] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy banner" }, { status: 404 });
    }

    const sql = `
      UPDATE banners 
      SET title = ?, image_url = ?, link = ?, is_active = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      title !== undefined ? title : existing[0].title,
      image_url !== undefined ? image_url : existing[0].image_url,
      link !== undefined ? link : existing[0].link,
      is_active !== undefined ? is_active : existing[0].is_active,
      id,
    ]);

    const [updated] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);

    return NextResponse.json({ 
      message: "Cập nhật banner thành công", 
      result: updated[0] 
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE - Xóa banner (chỉ admin)
export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Kiểm tra banner có tồn tại không
    const [existing] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy banner" }, { status: 404 });
    }

    await db.query("DELETE FROM banners WHERE id = ?", [id]);

    return NextResponse.json({ message: "Xóa banner thành công" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

