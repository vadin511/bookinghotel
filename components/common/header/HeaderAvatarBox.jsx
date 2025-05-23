"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  logoutUser,
  selectUser,
} from "../../../app/store/features/userSlice";
import avatar from "../../../public/assets/images/avatar.jpg";

export default function HeaderAvatarBox() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Fetch user profile when component mounts
  useEffect(() => {
    dispatch(fetchUserProfile());
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
    if (!user?.full_name) {
      // Nếu không có user.full_name (chưa đăng nhập) thì chuyển hướng đến trang login
      window.location.href = "/login";
    } else {
      // Nếu có user.full_name (đã đăng nhập) thì toggle dropdown
      setOpen(!open);
    }
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

  return (
    <div className="relative" ref={ref}>
      {/* Avatar tròn */}
      <button
        onClick={handleSubmit}
        className="flex items-center space-x-2 px-2 py-1 focus:outline-none bg-transparent"
      >
        <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden">
          <Image
            src={user?.avatar || avatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
            width={32}
            height={32}
          />
        </div>
        <span className="text-sm font-medium text-white">
          {user?.full_name}
        </span>
        {user && <i className="fas fa-chevron-down text-xs text-white"></i>}
      </button>

      {/* Box popup chỉ hiển thị khi user đã đăng nhập và open = true */}
      {user?.full_name && open && (
        <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium text-gray-800">
            <i className="fas fa-user mr-2"></i>
            Xin chào,{" "}
            <Link href="/profile" className="text-blue-600 hover:underline">
              {user.full_name}!
            </Link>
          </div>
          <div className="px-4 py-2 text-sm">
            <i class="fa-solid fa-envelope text-gray-800 mr-2"> </i>
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
  );
}
