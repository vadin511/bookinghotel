"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path) => {
    if (path === "/admin/homeDashboard" || path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/homeDashboard";
    }
    return pathname === path || pathname?.startsWith(path + "/");
  };
  return (
    <div
      className={`bg-[#513821] text-white transition-all duration-300 flex flex-col h-screen border-r border-[#4a3320] ${sidebarCollapsed ? "w-16" : "w-64"
        }`}
    >
      <div className="p-5 flex items-center justify-between flex-shrink-0 border-b border-[#4a3320]">
        {!sidebarCollapsed && (
          <h1 className="text-2xl font-bold">VadiGo Admin</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-[#4a3320] cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i
            className={`fas ${sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"
              } text-white`}
          ></i>
        </button>
      </div>


      <nav className="pt-4 overflow-y-auto flex-1 pb-4 sidebar-scroll">
        <div className="px-4 mb-2 text-sm uppercase text-white font-semibold">
          {!sidebarCollapsed && <span>Tổng Quan</span>}
        </div>
        <a
          href="/admin/homeDashboard"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/homeDashboard") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-tachometer-alt w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Trang chủ</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-sm uppercase text-white font-semibold">
          {!sidebarCollapsed && <span>Quản Lý</span>}
        </div>
        <a
          href="/admin/hotelManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/hotelManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-hotel w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Khách Sạn</span>}
        </a>
        <a
          href="/admin/roomManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/roomManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-door-open w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Phòng</span>}
        </a>
        <a
          href="/admin/bookingsManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/bookingsManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-calendar-check w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Đặt Phòng</span>}
        </a>
        <a
          href="/admin/userManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/userManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-users w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Người Dùng</span>}
        </a>
        <a
          href="/admin/reviewsManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/reviewsManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-star w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Đánh Giá</span>}
        </a>
        <a
          href="/admin/bannerManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/bannerManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-images w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Banners</span>}
        </a>
        <a
          href="/admin/postManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/postManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-newspaper w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Bài Viết</span>}
        </a>
        <a
          href="/admin/contactManagement"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/contactManagement") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-comments w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Liên hệ</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-sm uppercase text-white font-semibold">
          {!sidebarCollapsed && <span>Báo Cáo</span>}
        </div>
        <a
          href="/admin/statistics"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/statistics") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-chart-bar w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thống Kê</span>}
        </a>
        <a
          href="#"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            pathname === "#" ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-money-bill-wave w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thanh Toán</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-sm uppercase text-white font-semibold">
          {!sidebarCollapsed && <span>Hệ Thống</span>}
        </div>
        <a
          href="/admin/profile"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            isActive("/admin/profile") ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-user-circle w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thông tin cá nhân</span>}
        </a>
        <a
          href="#"
          className={`flex items-center py-3 px-4 hover:bg-[#4a3320] text-base transition-colors ${
            pathname === "#" ? "bg-[#6b4d2d] border-l-4 border-amber-400" : ""
          }`}
        >
          <i className="fas fa-cog w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Cài Đặt</span>}
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
