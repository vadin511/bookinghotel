"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import avatar from "../../../public/assets/images/avatar.jpg";

export default function HeaderAvatarBox() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Avatar tròn */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-300 focus:outline-none"
      >
        <Image src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
      </button>

      {/* Box popup bên dưới */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium text-gray-800">
            Xin chào, User!
          </div>
          <div className="px-4 py-2 text-sm text-gray-500 border-t">
            user@example.com
          </div>
          <div className="px-4 py-2 border-t">
            <button className="w-full text-left text-sm text-red-600 hover:underline">
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
