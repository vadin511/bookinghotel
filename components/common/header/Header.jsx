"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/assets/images/logo.png";
import HeaderAvatarBox from "./HeaderAvatarBox";
import MenuMobile from "./menuMobile/MenuMobile";
import NavBar from "./nav/NavBar";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ở các trang khác luôn có màu, ở trang home chỉ có màu khi scroll
  const shouldShowBackground = !isHomePage || isScrolled;

  return (
    <>
      <div className={`sticky p-1 sm:py-2 top-0 z-[500] transition-all duration-300 ${
        shouldShowBackground ? "bg-[#472E1E] border-b border-gray-300" : "bg-transparent"
      }`}>
        {/* <!-- Desktop Header --> */}
        <div className="hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex-shrink-1">
            <Link href="/" className="block group">
              <Image
                src={logo}
                width={240}
                height={80}
                className="h-14 w-auto md:h-16 transform-gpu object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
                alt="logo"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-evenly">
            <NavBar isScrolled={isScrolled} />
          </div>

          <div className="flex-shrink-0">
            <HeaderAvatarBox isScrolled={isScrolled} />
          </div>
        </div>

        {/* <!-- Mobile Header --> */}
        <div className="flex md:hidden items-center justify-between">
          <MenuMobile isScrolled={isScrolled} />
          {/* <!-- Logo --> */}
          <div className="flex-shrink-0 flex-1 flex justify-center">
            <Link href="/" className="block">
              <Image
                src={logo}
                width={240}
                height={80}
                className="h-10 w-auto transform-gpu object-contain transition-transform duration-200 ease-in-out"
                alt="logo"
              />
            </Link>
          </div>

          <div className="flex-shrink-0">
             <HeaderAvatarBox isScrolled={isScrolled} /> 
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
