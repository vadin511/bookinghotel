import Link from "next/link";
import { useState } from "react";

const MenuMobile = ({ isScrolled = false }) => {
  const [openMenu, setOpenMenu] = useState(false);

  const menuItems = [
    { href: "/", label: "Trang chủ", icon: "fa-home" },
    { href: "/contact", label: "Liên hệ", icon: "fa-phone" },
    { href: "/hotels", label: "Khách sạn", icon: "fa-hotel" },
    { href: "/services", label: "Dịch vụ", icon: "fa-concierge-bell" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className={`p-2 transition-all duration-300 focus:outline-none ${
          isScrolled 
            ? "text-white hover:text-amber-300" 
            : "text-gray-800 hover:text-amber-700"
        }`}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <span
            className={`absolute top-0 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
              openMenu ? "rotate-45 top-2.5" : ""
            }`}
          ></span>
          <span
            className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
              openMenu ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`absolute bottom-0 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
              openMenu ? "-rotate-45 bottom-2.5" : ""
            }`}
          ></span>
        </div>
      </button>
      {openMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpenMenu(false)}
          ></div>
          <div className="absolute left-0 top-full mt-2 bg-white w-64 border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideDown">
            <ul className="py-2">
              {menuItems.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-3 text-[#513821] hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group text-base"
                    onClick={() => setOpenMenu(false)}
                  >
                    <i className={`fas ${item.icon} mr-3 text-gray-400 group-hover:text-amber-600 transition-colors duration-200 w-5`}></i>
                    <span className="font-medium">{item.label}</span>
                    <i className="fas fa-chevron-right ml-auto text-sm text-gray-300 group-hover:text-amber-600 transition-colors duration-200"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuMobile;
