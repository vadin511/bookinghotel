"use client";

import { useState } from "react";

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return (
    <div
      className={`bg-indigo-900 text-white transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold">Hotel Admin</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-indigo-800 cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i
            className={`fas ${
              sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            } text-white`}
          ></i>
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 mb-2 text-xs uppercase text-indigo-300">
          {!sidebarCollapsed && <span>Tổng Quan</span>}
        </div>
        <a
          href="#"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "dashboard" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-tachometer-alt w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-indigo-300">
          {!sidebarCollapsed && <span>Quản Lý</span>}
        </div>
        <a
          href="#"
          onClick={() => setActiveTab("hotels")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "hotels" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-hotel w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Khách Sạn</span>}
        </a>
        <a
          href="#"
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "rooms" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-door-open w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Phòng</span>}
        </a>
        <a
          href="#"
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "bookings" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-calendar-check w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Đặt Phòng</span>}
        </a>
        <a
          href="#"
          onClick={() => setActiveTab("users")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "users" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-users w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Người Dùng</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-indigo-300">
          {!sidebarCollapsed && <span>Báo Cáo</span>}
        </div>
        <a
          href="#"
          onClick={() => setActiveTab("reports")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "reports" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-chart-bar w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thống Kê</span>}
        </a>
        <a
          href="#"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "payments" ? "bg-indigo-800" : "hover:bg-indigo-800"
          }`}
        >
          <i className="fas fa-money-bill-wave w-5"></i>
          {!sidebarCollapsed && <span className="ml-3">Thanh Toán</span>}
        </a>

        <div className="px-4 mb-2 mt-6 text-xs uppercase text-indigo-300">
          {!sidebarCollapsed && <span>Hệ Thống</span>}
        </div>
        <a
          href="#"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center py-3 px-4 ${
            activeTab === "settings" ? "bg-indigo-800" : "hover:bg-indigo-800"
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
