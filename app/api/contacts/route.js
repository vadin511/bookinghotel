// app/api/contacts/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

// Tạo contact mới
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    const { subject, message } = await req.json();

    // Validation
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { message: "Tiêu đề không được để trống" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: "Nội dung tin nhắn không được để trống" },
        { status: 400 }
      );
    }

    // Lưu contact vào database
    const sql = `
      INSERT INTO contacts (user_id, subject, message, status, created_at)
      VALUES (?, ?, ?, 'pending', NOW())
    `;

    const [result] = await db.query(sql, [
      user?.id || null,
      subject.trim(),
      message.trim(),
    ]);

    return NextResponse.json({
      message: "Gửi tin nhắn thành công",
      contact_id: result.insertId,
    });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi server khi gửi tin nhắn" },
      { status: 500 }
    );
  }
}

// Lấy danh sách contacts (chỉ admin)
export async function GET(req) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    // Lấy query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    // Xây dựng query
    let sql = `
      SELECT c.*, u.name AS user_name, u.email AS user_email
      FROM contacts c
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (status && status !== "all") {
      conditions.push(`c.status = ?`);
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push(`(
        c.subject LIKE ? OR 
        c.message LIKE ? OR 
        u.name LIKE ? OR 
        u.email LIKE ?
      )`);
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [contacts] = await db.query(sql, params);

    // Đếm tổng số contacts
    let countSql = `
      SELECT COUNT(*) as total 
      FROM contacts c
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const countParams = [];
    const countConditions = [];

    if (status && status !== "all") {
      countConditions.push(`c.status = ?`);
      countParams.push(status);
    }

    if (search && search.trim()) {
      countConditions.push(`(
        c.subject LIKE ? OR 
        c.message LIKE ? OR 
        u.name LIKE ? OR 
        u.email LIKE ?
      )`);
      const searchTerm = `%${search.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(" AND ")}`;
    }
    
    const [countResult] = await db.query(countSql, countParams);
    const total = countResult[0].total;

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

