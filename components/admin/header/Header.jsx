"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  logoutUser,
  selectUser,
} from "../../../app/store/features/userSlice";

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();
  const ref = useRef(null);
    const [open, setOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };
  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        alert(resultAction.payload.message);
        window.location.href = "/login";
      } else {
        alert("Đăng xuất thất bại. Vui lòng thử lại.");
      }
      setOpen(false);
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      alert("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };
  const handleSubmit = () => {
    if (!user) {
      // Nếu không có user.full_name (chưa đăng nhập) thì chuyển hướng đến trang login
      window.location.href = "/login";
    } else {
      // Nếu có user.full_name (đã đăng nhập) thì toggle dropdown
      setOpen(!open);
    }
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  const user = useSelector(selectUser);
  console.log("user", user);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fas fa-search text-gray-400"></i>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a3320]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer relative !rounded-button whitespace-nowrap"
            >
              <i className="fas fa-bell text-gray-600"></i>
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border">
                <h3 className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                  Thông Báo
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <i className="fas fa-calendar-check text-indigo-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Đặt phòng mới #1234
                      </p>
                      <p className="text-xs text-gray-500">15 phút trước</p>
                    </div>
                  </a>
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-exclamation-circle text-red-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Hủy đặt phòng #9876
                      </p>
                      <p className="text-xs text-gray-500">1 giờ trước</p>
                    </div>
                  </a>
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-money-bill-wave text-green-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Thanh toán thành công #5432
                      </p>
                      <p className="text-xs text-gray-500">3 giờ trước</p>
                    </div>
                  </a>
                </div>
                <a
                  href="#"
                  className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 px-4 py-2 border-t"
                >
                  Xem tất cả thông báo
                </a>
              </div>
            )}
          </div>

          <div className="relative" ref={ref}>
            {/* Avatar tròn */}

            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-2 py-1 focus:outline-none bg-transparent"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <span className="text-sm font-medium">Ad</span>
              </div>
              <span className="text-sm font-medium text-black">
                {user?.full_name}
              </span>
              {user && (
                <i className="fas fa-chevron-down text-xs text-black"></i>
              )}
            </button>

            {/* Box popup chỉ hiển thị khi user đã đăng nhập và open = true */}
            {user?.full_name && open && (
              <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 text-sm font-medium text-gray-800">
                  <i className="fas fa-user mr-2"></i>
                  Xin chào,{" "}
                  <Link
                    href="/profile"
                    className="text-blue-600 hover:underline"
                  >
                    {user.full_name}!
                  </Link>
                </div>
                <div className="px-4 py-2 text-sm">
                  <i className="fa-solid fa-envelope text-gray-800 mr-2"> </i>
                  {user.email}
                </div>
                <div className="px-4 py-2 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm cursor-pointer text-red-600 hover:underline"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
