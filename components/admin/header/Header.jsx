"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  selectUser
} from "../../../app/store/features/userSlice";

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
    const dispatch = useDispatch();

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };
  

    useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
    const user = useSelector(selectUser);
    console.log("user", user);
    

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fas fa-search text-gray-400"></i>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a3320]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer relative !rounded-button whitespace-nowrap"
            >
              <i className="fas fa-bell text-gray-600"></i>
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border">
                <h3 className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                  Thông Báo
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <i className="fas fa-calendar-check text-indigo-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Đặt phòng mới #1234
                      </p>
                      <p className="text-xs text-gray-500">15 phút trước</p>
                    </div>
                  </a>
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-exclamation-circle text-red-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Hủy đặt phòng #9876
                      </p>
                      <p className="text-xs text-gray-500">1 giờ trước</p>
                    </div>
                  </a>
                  <a href="#" className="px-4 py-3 hover:bg-gray-50 flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-money-bill-wave text-green-600"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Thanh toán thành công #5432
                      </p>
                      <p className="text-xs text-gray-500">3 giờ trước</p>
                    </div>
                  </a>
                </div>
                <a
                  href="#"
                  className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 px-4 py-2 border-t"
                >
                  Xem tất cả thông báo
                </a>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 cursor-pointer !rounded-button whitespace-nowrap"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <span className="text-sm font-medium">Ad</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
              {user?.full_name}
              </span>
              <i className="fas fa-chevron-down text-xs text-gray-500"></i>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-user mr-2"></i> Hồ sơ
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-cog mr-2"></i> Cài đặt
                </a>
                <div className="border-t my-1"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
