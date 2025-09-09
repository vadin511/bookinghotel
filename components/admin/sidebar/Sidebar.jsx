"use client";

import { useState } from "react";

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return (
    <div
      className={`bg-[#513821] text-white transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold">Hotel Admin</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-[#4a3320] cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i
            className={`fas ${
              sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            } text-white`}
          ></i>
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 mb-2 text-xs uppercase text-white">
          {!sidebarCollapsed && <span>Tổng Quan</span>}
        </div>
        <a
          href="/admin/homeDashboard"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-tachometer-alt w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-white">
          {!sidebarCollapsed && <span>Quản Lý</span>}
        </div>
        <a
          href="/admin/hotelManagement"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-hotel w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Khách Sạn</span>}
        </a>
        <a
          href="/admin/roomManagement"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-door-open w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Phòng</span>}
        </a>
        <a
          href="/admin/bookingsManagement"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-calendar-check w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Đặt Phòng</span>}
        </a>
        <a
          href="/admin/userManagement"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-users w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Người Dùng</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-white">
          {!sidebarCollapsed && <span>Báo Cáo</span>}
        </div>
        <a
          href="#"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-chart-bar w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thống Kê</span>}
        </a>
        <a
          href="#"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-money-bill-wave w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thanh Toán</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-white">
          {!sidebarCollapsed && <span>Hệ Thống</span>}
        </div>
        <a
          href="#"
          className={"flex items-center py-3 px-4 hover:bg-[#4a3320]"}
        >
          <i className="fas fa-cog w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Cài Đặt</span>}
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
