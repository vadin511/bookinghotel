"use client";

import Link from "next/link";

const NavBar = ({ isScrolled = false }) => {
  const menuItems = [
    { href: "/", label: "Trang chủ", icon: "fa-home" },
    { href: "/contact", label: "Liên hệ", icon: "fa-phone" },
    { href: "/hotels", label: "Khách sạn", icon: "fa-hotel" },
    { href: "/posts", label: "Bài viết", icon: "fa-newspaper" },
  ];

  return (
    <nav className="w-full">
      <ul className="flex items-center justify-center gap-1 lg:gap-2 xl:gap-4">
        {menuItems.map((item) => (
          <li key={item.href} className="flex-shrink-0">
            <Link
              href={item.href}
              className={`relative px-3 lg:px-5 xl:px-6 py-2.5 text-base lg:text-lg xl:text-xl font-medium transition-all duration-300 group block ${
                isScrolled 
                  ? "text-white font-semibold hover:text-amber-300" 
                  : "text-white font-semibold hover:text-amber-700"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                <i className={`fas ${item.icon} text-sm lg:text-base flex-shrink-0`}></i>
                <span className="relative">{item.label}</span>
              </span>
              <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-[calc(100%-0.5rem)] rounded-full ${
                isScrolled ? "bg-amber-300" : "bg-amber-700"
              }`}></span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
