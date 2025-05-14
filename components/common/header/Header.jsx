"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/assets/images/logo.svg";
import HeaderAvatarBox from "./HeaderAvatarBox";
import MenuMobile from "./menuMobile/MenuMobile";
import NavBar from "./nav/NavBar";

const Header = () => {
  return (
    <>
      <div className=" bg-[#513821]">
        {/* <!-- Desktop Header --> */}
        <div className="hidden md:flex items-center justify-around">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src={logo}
                className="h-12 w-auto md:h-15 md:w-60 transform-gpu object-contain transition-transform duration-200 ease-in-out"
                alt="logo"
              />
            </Link>
          </div>

          <div>
            <NavBar />
          </div>

          <div className="flex-shrink-0">
            <HeaderAvatarBox />
          </div>
        </div>

        {/* <!-- Mobile Header --> */}
        <div className="flex md:hidden items-center justify-around">
          <MenuMobile />
          {/* <!-- Logo --> */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src={logo}
                className="h-12 w-auto md:h-15 md:w-60 transform-gpu object-contain transition-transform duration-200 ease-in-out"
                alt="logo"
              />
            </Link>
          </div>

          <div className="flex-shrink-0">
            <HeaderAvatarBox />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
