"use client";

import Link from "next/link";

const NavBar = () => {
  return (
    <ul className="flex items-center space-x-10 text-xl font-light text-white gap-6 ">
      <li>
        <Link
          href="/"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Trang chủ
        </Link>
      </li>
      <li>
        <Link
          href="/products"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Sản phẩm
        </Link>
      </li>
      <li>
        <Link
          href="/services"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Dịch vụ
        </Link>
      </li>
      <li>
        <Link
          href="/contact"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Liên hệ
        </Link>
      </li>
    </ul>
  );
};

export default NavBar;
