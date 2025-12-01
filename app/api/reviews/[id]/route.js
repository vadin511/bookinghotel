import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

// Xóa review
export async function DELETE(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Chỉ admin mới được xóa review
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Chỉ admin mới có quyền xóa đánh giá" },
        { status: 403 }
      );
    }

    // Xử lý params
    let id;
    try {
      if (params && typeof params.then === "function") {
        const resolvedParams = await params;
        id = resolvedParams?.id;
      } else {
        id = params?.id;
      }

      if (!id) {
        return NextResponse.json(
          { message: "Thiếu ID đánh giá" },
          { status: 400 }
        );
      }
    } catch (paramError) {
      return NextResponse.json(
        { message: "Lỗi xử lý tham số", error: paramError.message },
        { status: 400 }
      );
    }

    // Kiểm tra review có tồn tại không
    const [reviewCheck] = await db.query(
      `SELECT id FROM reviews WHERE id = ?`,
      [id]
    );

    if (reviewCheck.length === 0) {
      return NextResponse.json(
        { message: "Đánh giá không tồn tại" },
        { status: 404 }
      );
    }

    // Xóa review
    await db.query(`DELETE FROM reviews WHERE id = ?`, [id]);

    return NextResponse.json({
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { message: "Lỗi server", error: error.message },
      { status: 500 }
    );
  }
}














