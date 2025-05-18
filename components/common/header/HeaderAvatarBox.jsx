"use client";
import { useUser } from "@/User/page";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import avatar from "../../../public/assets/images/avatar.jpg";

export default function HeaderAvatarBox() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const { user } = useUser();

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
      const res = await fetch("/api/logout", {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message);
        window.location.href = "/login"; 
      setOpen(!open);
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      alert("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Avatar tròn */}
      <button
        className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-300 focus:outline-none"
        onClick={handleSubmit}
      >
        <Image
          src={user?.avatar || avatar} // Sử dụng avatar của user nếu có, không thì dùng ảnh mặc định
          alt="User Avatar"
          className="w-full h-full object-cover"
          width={32}
          height={32}
        />
      </button>

      {/* Box popup chỉ hiển thị khi user đã đăng nhập và open = true */}
      {user?.full_name && open && (
        <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium text-gray-800">
            Xin chào,{" "}
            <Link href="/profile" className="text-blue-600 hover:underline">
              {user.full_name}!
            </Link>
          </div>
          <div className="px-4 py-2 text-sm text-gray-500 border-t">
            {user.email}
          </div>
          <div className="px-4 py-2 border-t">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-600 hover:underline"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
