"use client";

import Image from "next/image";
import logo from "../../../public/assets/images/logo.svg";

const Header = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-3 bg-black">
        {/* <!-- Desktop Header --> */}
        <div className="hidden md:flex items-center justify-between">
          {/* <!-- Logo --> */}
          <div className="flex-shrink-0">
            <a href="#">
              <Image
                src={logo}
                className="h-12 w-auto md:h-15 md:w-60 transform-gpu object-contain transition-transform duration-200 ease-in-out"
                alt="logo"
              />
            </a>
          </div>

          {/* <!-- Danh mục --> */}
          <nav className="flex space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Sản phẩm
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dịch vụ
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Liên hệ
            </a>
          </nav>

          {/* <!-- Box login tròn --> */}
          <div className="flex-shrink-0">
            <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* <!-- Mobile Header --> */}
        <div className="flex md:hidden items-center justify-between">
          {/* <!-- Button menu --> */}
          <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* <!-- Logo --> */}
          <div className="flex-shrink-0">
            <a href="#">
              {/* <img src="https://via.placeholder.com/150x50?text=Logo" alt="Logo" className="h-8"> */}
            </a>
          </div>

          {/* <!-- Box login tròn --> */}
          <div className="flex-shrink-0">
            <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
