"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchUserProfile,
  logoutUser,
  selectUser,
} from "../../../app/store/features/userSlice";
import avatar from "../../../public/assets/images/avatar.jpg";

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
  
  const user = useSelector(selectUser);
  
  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message);
        setOpen(false);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
      setOpen(false);
    }
  };
  const handleSubmit = () => {
    if (!user) {
      // Nếu không có user.name (chưa đăng nhập) thì chuyển hướng đến trang login
      window.location.href = "/login";
    } else {
      // Nếu có user.name (đã đăng nhập) thì toggle dropdown
      setOpen(!open);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const resultAction = await dispatch(fetchUserProfile());
      
      // Nếu tài khoản bị blocked, đăng xuất và hiển thị thông báo
      if (fetchUserProfile.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error?.blocked) {
          toast.error(error.message || "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với tổng đài VadiGo để được sử dụng");
          // Đăng xuất tự động
          await dispatch(logoutUser());
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      }
    };
    
    fetchProfile();
  }, [dispatch]);

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

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
              className="pl-10 pr-4 py-2 w-full border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4a3320]"
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
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-sm text-white flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border">
                <h3 className="px-4 py-2 text-base font-medium text-gray-700 border-b">
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
                      <p className="text-base font-medium text-gray-900">
                        Đặt phòng mới #1234
                      </p>
                      <p className="text-sm text-gray-500">15 phút trước</p>
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
                  className="block text-center text-base font-medium text-indigo-600 hover:text-indigo-500 px-4 py-2 border-t"
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
              className="flex items-center space-x-2 px-3 py-2 rounded-lg focus:outline-none bg-transparent hover:bg-gray-100 transition-all duration-300 group"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-200 group-hover:ring-indigo-400 transition-all duration-300">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    width={36}
                    height={36}
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white">
                    <span className="text-base font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-base font-medium text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                {user?.name || "Quản trị viên"}
              </span>
              {user && (
                <i className="fas fa-chevron-down text-sm text-gray-600 group-hover:text-indigo-600 transition-all duration-300 transform group-hover:rotate-180"></i>
              )}
            </button>

            {/* Box popup chỉ hiển thị khi user đã đăng nhập và open = true */}
            {user?.name && open && (
              <div className="absolute right-0 top-14 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                {/* Header với gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <span className="text-lg font-medium text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold truncate">
                        Xin chào,{" "}
                        <Link
                          href="/admin/profile"
                          className="hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {user.name}!
                        </Link>
                      </p>
                      <p className="text-sm text-indigo-100 truncate mt-0.5">
                        <i className="fa-solid fa-envelope mr-1"></i>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    href="/admin/profile"
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <i className="fas fa-user-circle mr-3 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200 w-5"></i>
                    <span>Thông tin cá nhân</span>
                    <i className="fas fa-chevron-right ml-auto text-sm text-gray-300 group-hover:text-indigo-600 transition-colors duration-200"></i>
                  </Link>
                </div>

                {/* Logout button */}
                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <i className="fas fa-sign-out-alt mr-2 group-hover:translate-x-1 transition-transform duration-200"></i>
                    <span>Đăng xuất</span>
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
