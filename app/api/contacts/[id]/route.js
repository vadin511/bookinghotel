// app/api/contacts/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

// Cập nhật status của contact (chỉ admin)
export async function PUT(req, { params }) {
  try {
    const user = getUserFromToken(req);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    } else {
      id = params?.id;
    }

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID liên hệ" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    // Validation status
    const validStatuses = ["pending", "replied"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Status không hợp lệ" },
        { status: 400 }
      );
    }

    const sql = `UPDATE contacts SET status = ? WHERE id = ?`;
    await db.query(sql, [status, id]);

    return NextResponse.json({
      message: "Cập nhật status thành công",
    });
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

// Xóa contact (chỉ admin)
export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let id;
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      id = resolvedParams?.id;
    } else {
      id = params?.id;
    }

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID liên hệ" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM contacts WHERE id = ?`;
    await db.query(sql, [id]);

    return NextResponse.json({
      message: "Xóa contact thành công",
    });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

