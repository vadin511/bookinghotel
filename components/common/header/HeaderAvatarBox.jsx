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

export default function HeaderAvatarBox({ isScrolled = false }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile when component mounts
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

  const handleSubmit = () => {
    if (!user) {
      // Nếu không có user.name (chưa đăng nhập) thì chuyển hướng đến trang login
      window.location.href = "/login";
    } else {
      // Nếu có user.name (đã đăng nhập) thì toggle dropdown
      setOpen(!open);
    }
  };

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

  return (
    <div className="relative" ref={ref}>
      {/* Avatar tròn */}
      <button
        onClick={handleSubmit}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg focus:outline-none bg-transparent transition-all duration-300 group ${
          isScrolled 
            ? "hover:bg-white/10" 
            : "hover:bg-white/10"
        }`}
      >
        <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 transition-all duration-300 ${
          isScrolled 
            ? "ring-white/30 group-hover:ring-amber-300" 
            : "ring-white/30 group-hover:ring-amber-600"
        }`}>
          <Image
            src={user?.avatar || avatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
          {!user && (
            <div className="absolute inset-0"></div>
          )}
        </div>
        {mounted && user?.name && (
          <>
            <span className={`hidden lg:block text-base font-medium transition-colors duration-300 ${
              isScrolled 
                ? "text-white group-hover:text-amber-300" 
                : "text-white group-hover:text-amber-700"
            }`}>
              {user.name}
            </span>
            <i className={`fas fa-chevron-down text-sm transition-all duration-300 transform group-hover:rotate-180 ${
              isScrolled 
                ? "text-white group-hover:text-amber-300" 
                : "text-white group-hover:text-amber-700"
            }`}></i>
          </>
        )}
        {mounted && !user && (
          <span className={`hidden lg:block text-base font-medium transition-colors duration-300 ${
            isScrolled 
              ? "text-white group-hover:text-amber-300" 
              : "text-white group-hover:text-amber-700"
          }`}>
            Đăng nhập
          </span>
        )}
      </button>

      {/* Box popup chỉ hiển thị khi user đã đăng nhập và open = true */}
      {mounted && user?.name && open && (
        <div className="absolute right-0 top-14 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden opacity-0 animate-fadeIn">
          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                <Image
                  src={user?.avatar || avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold truncate">
                  Xin chào, {user.name}!
                </p>
                <p className="text-sm text-amber-100 truncate mt-0.5">
                  <i className="fa-solid fa-envelope mr-1"></i>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
              onClick={() => setOpen(false)}
            >
              <i className="fas fa-user-circle mr-3 text-gray-400 group-hover:text-amber-600 transition-colors duration-200 w-5"></i>
              <span>Thông tin cá nhân</span>
              <i className="fas fa-chevron-right ml-auto text-sm text-gray-300 group-hover:text-amber-600 transition-colors duration-200"></i>
            </Link>
            <Link
              href="/my-bookings"
              className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
              onClick={() => setOpen(false)}
            >
              <i className="fas fa-calendar-check mr-3 text-gray-400 group-hover:text-amber-600 transition-colors duration-200 w-5"></i>
              <span>Đặt phòng của tôi</span>
              <i className="fas fa-chevron-right ml-auto text-sm text-gray-300 group-hover:text-amber-600 transition-colors duration-200"></i>
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
  );
}
