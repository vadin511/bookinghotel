"use client";
import { useState } from "react";
import Header from "../../../components/admin/header/Header";
import Sidebar from "../../../components/admin/sidebar/Sidebar";

const AdminLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
