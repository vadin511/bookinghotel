"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import avatar from "../../../public/assets/images/avatar.jpg";

export default function HeaderAvatarBox() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });
    const data = await res.json();
    alert(data.message);
    router.push("/login");
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar tròn */}
      <button
        className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-300 focus:outline-none"
      >
        <Image src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
      </button>

      {/* Box popup bên dưới */}
      {open && (
        <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium text-gray-800">
            Xin chào, <Link href="/user" className="text-blue-600 hover:underline">name!</Link>
          </div>
          <div className="px-4 py-2 text-sm text-gray-500 border-t">
            user@example.com
          </div>
          <div className="px-4 py-2 border-t">
            <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 hover:underline">
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
