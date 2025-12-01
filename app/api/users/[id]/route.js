import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET user by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
    }
    
    const user = rows[0];
    // Không trả về password
    delete user.password;
    return NextResponse.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

// PUT - Cập nhật user
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, email, avatar, gender, address, phone, role, password } = body;

    // Kiểm tra user có tồn tại không
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // Kiểm tra email trùng (nếu thay đổi email)
    if (email && email !== existingUser[0].email) {
      const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 400 });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (password !== undefined && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return NextResponse.json({ message: 'Không có dữ liệu để cập nhật' }, { status: 400 });
    }

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(sql, updateValues);

    // Lấy lại thông tin user đã cập nhật
    const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    const updatedUser = updatedUsers[0];
    delete updatedUser.password;

    return NextResponse.json({ 
      message: 'Cập nhật người dùng thành công', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

// DELETE - Ẩn/Kích hoạt người dùng (toggle status)
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Kiểm tra user có tồn tại không
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
    }

    const currentStatus = existingUser[0].status || 'active';
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const action = newStatus === 'blocked' ? 'ẩn' : 'kích hoạt';

    // Cập nhật status
    await db.query(
      "UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, id]
    );

    return NextResponse.json({ 
      message: `Đã ${action} người dùng thành công`,
      status: newStatus
    });
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

