import Link from "next/link";
import { useState } from "react";

const MenuMobile = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div>
      <button onClick={() => setOpenMenu(!openMenu)} className="text-xl">
        {openMenu ? (
          <i className="fa-solid fa-x"></i>
        ) : (
          <i className="fa-solid fa-bars"></i>
        )}
      </button>
      {openMenu && (
        <div className="absolute left-0 top-12 mt-2 bg-[#eeebe9] w-full border-b border-gray-400 rounded-b-lg shadow-lg z-50">
          <ul className=" !m-2 text-[#513821]  ">
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
        </div>
      )}
    </div>
  );
};

export default MenuMobile;
