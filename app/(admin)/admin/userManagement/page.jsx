"use client";
import { useEffect, useState } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Người dùng</h2>
      <button className="mb-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
        + Thêm Người dùng
      </button>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Tên người dùng</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Vai trò</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.id}</td>
                <td className="border px-4 py-2">{user.full_name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role_id}</td>
            
                <td className="border px-4 py-2 space-x-2">
                  <button className="text-blue-500 hover:underline">Sửa</button>
                  <button className="text-red-500 hover:underline">Xoá</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="6">
                Không có dữ liệu người dùng.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
