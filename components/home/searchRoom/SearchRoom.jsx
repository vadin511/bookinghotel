"use client";

import { useState } from "react";

const SearchRoom = () => {
  const [destination, setDestination] = useState("");
  const [childrenCount, setChildrenCount] = useState(0);

  const destinations = [
    { value: "hanoi", label: "Hà Nội" },
    { value: "danang", label: "Đà Nẵng" },
    { value: "hochiminh", label: "TP.HCM" },
    { value: "dalat", label: "Đà Lạt" },
    { value: "nhatrang", label: "Nha Trang" },
  ];

  return (
    <div className="  bg-[#eeebe9] rounded-full flex flex-wrap justify-around p-6 ">
      <div className="relative inline-flex items-center border border-gray-300 rounded-full pl-12 pr-10 py-4  text-xl text-[#5a3f26]">
        {/* Icon search bên trái */}
        <div className="absolute left-3 pointer-events-none">
          <i className="fas fa-search text-lg"></i>
        </div>
        {/* Select box */}
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="appearance-none focus:outline-none font-serif rounded-full  cursor-pointer"
        >
          <option value="">Loại phòng</option>
          {destinations.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {/* Chevron down bên phải */}
        <div className="absolute right-3 pointer-events-none">
          <i className="fas fa-chevron-down "></i>
        </div>
      </div>

      {/* Time Range Select */}
      <button>
        <div className="relative flex items-center gap-2 border border-gray-300 rounded-full text-[#5a3f26]  text-xl font-serif cursor-pointer min-w-[140px] md:min-w-[180px] pl-12 pr-10 py-4">
          {/* Icon lịch */}
          <i className="far fa-calendar-alt "></i>

          {/* Nội dung ngày */}
          <div className="flex items-center gap-1">
            <span>Check-in</span>
            <span className="text-gray-400 ">→</span>
            <span>Check-out</span>
          </div>
        </div>
      </button>

      {/* Children Count Input */}
      <div className="relative">
        <div className="flex items-center justify-between gap-5 border border-gray-300 rounded-full text-[#5a3f26] text-xl  font-serif cursor-pointer min-w-[180px] pl-12 pr-10 py-4 ">
          {/* Icon và nhãn */}
          <div className="flex items-center gap-2">
            <i className="fas fa-user-friends "></i>
            <span>Trẻ em:</span>
          </div>

          {/* Bộ đếm */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-sm flex items-center justify-center transition"
            >
              –
            </button>
            <span className="min-w-[16px] text-center">{childrenCount}</span>
            <button
              onClick={() => setChildrenCount(childrenCount + 1)}
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-sm flex items-center justify-center transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Toggle */}
      <div className="flex items-center gap-4 space-x-3 border border-gray-300 rounded-full text-[#5a3f26] text-xl font-serif cursor-pointer min-w-[140px] md:min-w-[180px] pl-12 pr-10 py-4 ">
        <i class="fas fa-gift"></i>
        <span>Khuyến mãi</span>
      </div>

      <button
        className="bg-[#5a3f26] text-white rounded-full text-xl font-serif cursor-pointer min-w-[140px] md:min-w-[180px] px-4 py-2 hover:bg-[#4a3320] transition-colors"
        type="submit"
      >
        Book
      </button>
    </div>
  );
};

export default SearchRoom;
