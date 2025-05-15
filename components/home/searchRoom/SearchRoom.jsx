"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export default function SearchRoom() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 500;
      setIsSticky(window.scrollY > heroHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={clsx(
        "w-full z-50 transition-all duration-300 px-4",
        isSticky
          ? "fixed top-[64px] left-0 bg-white shadow-md"
          : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      )}
    >
      <div
        aria-label="Booking form"
        className="sticky bottom-10 left-1/2 -translate-x-1/2  bg-white rounded-full flex flex-wrap gap-4 px-6 py-4 max-w-6xl w-[90%] md:w-[85%] lg:w-[75%]"
      >
        <div className="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
          {/* select */}
        </div>
        <div className="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
          {/* thoiwff gian */}
        </div>
        <div className="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
          {/* trẻ */}
        </div>
        <div className="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
          {/* khuyến mãi */}
        </div>
        <button
          className="bg-[#5a3f26] text-white rounded-full px-6 py-3 text-sm font-serif font-normal min-w-[80px] md:min-w-[100px] hover:bg-[#4a3320] transition-colors"
          type="submit"
        >
          Book
        </button>
      </div>
    </div>
  );
}
