"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import ActionDropdown from "@/components/common/ActionDropdown";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    avatar: "",
    gender: "",
    address: "",
    phone: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by role
  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    const userRole = user.role || user.role_id;
    return userRole === roleFilter;
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi fetch users:", error);
      toast.error("Lỗi khi tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("photos", file);

    try {
      const res = await axios.post("http://localhost:3000/api/upload", data);
      const { files: uploadedFilenames } = res.data;
      if (uploadedFilenames && uploadedFilenames.length > 0) {
        const avatarUrl = `/uploads/${uploadedFilenames[0]}`;
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
        toast.success("Upload avatar thành công!");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      toast.error("Lỗi khi upload avatar!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!isEditing && !formData.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }

    try {
      if (isEditing) {
        // Cập nhật user
        const updateData = {
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar || null,
          gender: formData.gender || null,
          address: formData.address || null,
          phone: formData.phone || null,
          role: formData.role,
        };

        // Chỉ thêm password nếu có
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password;
        }

        const res = await fetch(`http://localhost:3000/api/users/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(`Cập nhật người dùng "${formData.name}" thành công!`);
          // Cập nhật ngay trong state thay vì fetch lại
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === formData.id
                ? { ...user, ...updateData, id: formData.id }
                : user
            )
          );
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(data.message || "Cập nhật người dùng thất bại!");
        }
      } else {
        // Tạo user mới (admin tạo, skip OTP)
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          skipOTP: true, // Bỏ qua OTP cho admin
        };

        const res = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        });

        const data = await res.json();

        if (res.ok && data.user) {
          // Sau khi tạo user, cập nhật thông tin bổ sung
          const userId = data.user.id;
          if (formData.avatar || formData.gender || formData.address || formData.phone) {
            const updateRes = await fetch(`http://localhost:3000/api/users/${userId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                avatar: formData.avatar || null,
                gender: formData.gender || null,
                address: formData.address || null,
                phone: formData.phone || null,
              }),
            });

            if (!updateRes.ok) {
              toast.warning("Tạo người dùng thành công nhưng cập nhật thông tin bổ sung thất bại!");
            }
          }

          toast.success(`Thêm người dùng "${formData.name}" thành công!`);
          // Thêm người dùng mới vào state ngay lập tức
          if (data.user) {
            setUsers((prevUsers) => [...prevUsers, data.user]);
          } else {
            // Nếu không có user trong response, fetch lại
            fetchUsers();
          }
          setIsModalOpen(false);
          resetForm();
        } else {
          toast.error(data.message || "Thêm người dùng thất bại!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi submit:", error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      name: user.name || user.full_name || "",
      email: user.email || "",
      password: "",
      avatar: user.avatar || "",
      gender: user.gender || "",
      address: user.address || "",
      phone: user.phone || "",
      role: user.role || user.role_id || "user",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const user = users.find((u) => u.id === id);
    const userName = user ? (user.name || user.full_name) : "người dùng này";
    const isBlocked = user?.status === "blocked";
    const action = isBlocked ? "kích hoạt" : "ẩn";

    setConfirmDialog({
      isOpen: true,
      title: isBlocked ? "Kích hoạt người dùng" : "Ẩn người dùng",
      message: `Bạn có chắc chắn muốn ${action} người dùng "${userName}"?`,
      confirmText: isBlocked ? "Kích hoạt" : "Ẩn",
      type: isBlocked ? "info" : "warning",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/users/${id}`, {
            method: "DELETE",
          });

          const data = await res.json();

          if (res.ok) {
            toast.success(`Đã ${action} người dùng "${userName}" thành công!`);
            // Cập nhật trạng thái ngay lập tức
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === id
                  ? { ...u, status: isBlocked ? "active" : "blocked" }
                  : u
              )
            );
          } else {
            toast.error(data.message || `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng "${userName}" thất bại!`);
          }
        } catch (error) {
          console.error(`Lỗi khi ${action} người dùng:`, error);
          toast.error(`Có lỗi xảy ra khi ${action} người dùng!`);
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      password: "",
      avatar: "",
      gender: "",
      address: "",
      phone: "",
      role: "user",
    });
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "user":
        return "Người dùng";
      default:
        return role || "Người dùng";
    }
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Quản lý Người dùng</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            resetForm();
          }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm Người dùng</span>
        </button>
        <div className="w-full sm:w-auto sm:min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo vai trò:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
          >
            <option value="all">Tất cả</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="mb-4">
          <Loading message="Đang tải dữ liệu..." color="indigo" size="sm" className="h-32" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Tên</th>
              <th className="border px-4 py-2 text-left">Avatar</th>
              <th className="border px-4 py-2 text-left">Địa chỉ</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Vai trò</th>
              <th className="border px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === "blocked" ? "bg-gray-100 opacity-60" : ""}>
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2 font-medium">
                    {user.name || user.full_name || "Chưa có tên"}
                  </td>
                  <td className="border px-4 py-2">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || user.full_name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                        {user.name?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </td>
                  <td className="border px-4 py-2">{user.address || "Chưa cập nhật"}</td>
                  <td className="border px-4 py-2">{user.phone || "Chưa cập nhật"}</td>
                  <td className="border px-4 py-2">{user.email || "Chưa cập nhật"}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === "admin" || user.role_id === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {getRoleLabel(user.role || user.role_id)}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(user),
                        },
                        {
                          divider: true,
                        },
                        {
                          label: "Sửa",
                          icon: "fas fa-edit",
                          onClick: () => handleEdit(user),
                        },
                        {
                          label: user.status === "blocked" ? "Kích hoạt" : "Ẩn",
                          icon: user.status === "blocked" ? "fas fa-check-circle" : "fas fa-eye-slash",
                          onClick: () => handleDelete(user.id),
                          success: user.status === "blocked",
                          warning: user.status !== "blocked",
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="8">
                  {roleFilter !== "all" 
                    ? `Không có người dùng nào với vai trò "${roleFilter === "admin" ? "Quản trị viên" : "Người dùng"}"` 
                    : "Không có dữ liệu người dùng."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => {
            setIsModalOpen(false);
            setIsEditing(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold mb-4">
              {isEditing ? "Sửa Người dùng" : "Thêm Người dùng"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-base">Tên người dùng *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded text-base"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded text-base"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">
                  Mật khẩu {isEditing ? "(để trống nếu không đổi)" : "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  className="w-full p-2 border border-gray-300 rounded text-base"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="mb-2 text-base"
                />
                {formData.avatar && (
                  <div className="mt-2 relative inline-block group">
                    <Image
                      src={formData.avatar}
                      alt="Avatar preview"
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          avatar: "",
                        }));
                        toast.success("Đã xóa avatar!");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                      title="Xóa avatar"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-base"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-base"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-base"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-base"
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-base font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-times"></i>
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg hover:shadow-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isEditing
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  }`}
                >
                  <i className={isEditing ? "fas fa-save" : "fas fa-plus-circle"}></i>
                  <span>{isEditing ? "Cập nhật" : "Thêm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-700 to-purple-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedUser.name || selectedUser.full_name || `User #${selectedUser.id}`}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-envelope mr-2"></i>
                      {selectedUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white ${
                    selectedUser.status === "blocked"
                      ? "text-red-800 border-red-300"
                      : "text-green-800 border-green-300"
                  }`}
                >
                  <i className={`fas ${selectedUser.status === "blocked" ? "fa-ban" : "fa-check-circle"} mr-1`}></i>
                  {selectedUser.status === "blocked" ? "Đã ẩn" : "Hoạt động"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white ${
                    (selectedUser.role === "admin" || selectedUser.role_id === "admin")
                      ? "text-red-800 border-red-300"
                      : "text-blue-800 border-blue-300"
                  }`}
                >
                  <i className="fas fa-user-tag mr-1"></i>
                  {getRoleLabel(selectedUser.role || selectedUser.role_id)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Avatar */}
              <div className="mb-6 flex justify-center">
                {selectedUser.avatar ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200">
                    <Image
                      src={selectedUser.avatar}
                      alt={selectedUser.name || selectedUser.full_name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600 border-4 border-purple-200">
                    {(selectedUser.name?.[0] || selectedUser.full_name?.[0] || "?").toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-purple-700"></i>
                  Thông tin người dùng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedUser.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tên</p>
                    <p className="font-medium text-gray-900">
                      {selectedUser.name || selectedUser.full_name || "Chưa có tên"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Giới tính</p>
                    <p className="font-medium text-gray-900">{getGenderLabel(selectedUser.gender)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{selectedUser.address || "Chưa cập nhật"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                    <p className="font-medium text-gray-900">
                      {getRoleLabel(selectedUser.role || selectedUser.role_id)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <p className="font-medium text-gray-900">
                      {selectedUser.status === "blocked" ? "Đã ẩn" : "Hoạt động"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Sửa người dùng</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDelete(selectedUser.id);
                  }}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md ${
                    selectedUser.status === "blocked"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  <i className={`fas ${selectedUser.status === "blocked" ? "fa-check-circle" : "fa-eye-slash"}`}></i>
                  <span>{selectedUser.status === "blocked" ? "Kích hoạt" : "Ẩn"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default UserManagement;
