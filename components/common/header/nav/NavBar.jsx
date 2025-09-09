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
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/hotels"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Hotels 
        </Link>
      </li>
      <li>
        <Link
          href="/services"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Services
        </Link>
      </li>
      <li>
        <Link
          href="/contact"
          className="hover:text-blue-500 transition-colors duration-300"
        >
          Contact
        </Link>
      </li>
    </ul>
  );
};

export default NavBar;
