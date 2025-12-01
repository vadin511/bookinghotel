"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";

const HomeDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const router = useRouter();

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format ngày tháng cho modal (chi tiết hơn)
  const formatDateDetail = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      paid: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const statusLabels = {
      pending: "Đang chờ",
      confirmed: "Đã xác nhận",
      paid: "Đã thanh toán",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };

    const statusInfo = {
      text: statusLabels[status] || status,
      color: statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // Open detail modal
  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  // Lấy initials từ tên
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch stats");
        }
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  // Fetch recent bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const res = await fetch("/api/bookings?limit=5", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await res.json();
        setRecentBookings(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchRecentBookings();
  }, []);

  // Chart options
  const revenueOption = stats
    ? {
        animation: false,
        title: {
          text: "Doanh Thu Theo Tháng",
          left: "center",
          textStyle: {
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const value = params[0].value;
            return `${params[0].name}<br/>${formatCurrency(value)}`;
          },
        },
        xAxis: {
          type: "category",
          data: stats.charts?.months || [],
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value) => {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + "M";
              }
              return value;
            },
          },
        },
        series: [
          {
            data: stats.charts?.revenue || [],
            type: "line",
            smooth: true,
            lineStyle: {
              color: "#4F46E5",
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(79, 70, 229, 0.4)" },
                  { offset: 1, color: "rgba(79, 70, 229, 0.1)" },
                ],
              },
            },
          },
        ],
      }
    : null;

  const bookingOption = stats
    ? {
        animation: false,
        title: {
          text: "Số Lượng Đặt Phòng",
          left: "center",
          textStyle: {
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: stats.charts?.months || [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: stats.charts?.bookings || [],
            type: "bar",
            itemStyle: {
              color: "#10B981",
            },
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Loading message="Đang tải dữ liệu..." color="indigo" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="text-center py-10">
          <p className="text-red-600">Không thể tải dữ liệu dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      {activeTab === "dashboard" && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800"></h1>
            <div className="flex space-x-2">
              <div className="relative">
                <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  <i className="fas fa-calendar-alt"></i>
                  <span>{new Date().toLocaleDateString("vi-VN")} - Hôm nay</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer !rounded-button whitespace-nowrap">
                <i className="fas fa-download mr-2"></i>
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* Tổng quan của sàn */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tổng Quan Của Sàn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">
                      Tổng Doanh Thu
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {formatCurrency(stats.stats.totalRevenue)}
                    </h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      stats.stats.revenueChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${stats.stats.revenueChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(stats.stats.revenueChange)}% so với tháng trước</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-money-bill-wave text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-100">Đặt Phòng</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.stats.totalBookings}</h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      stats.stats.bookingsChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${stats.stats.bookingsChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(stats.stats.bookingsChange)}% so với tháng trước</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      Tỷ Lệ Lấp Đầy
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stats.stats.occupancyRate}%
                    </h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      stats.stats.occupancyChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${stats.stats.occupancyChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(stats.stats.occupancyChange)}% so với tháng trước</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-bed text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-100">
                      Khách Hàng Mới
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stats.stats.newUsers}</h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      stats.stats.usersChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${stats.stats.usersChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(stats.stats.usersChange)}% so với tháng trước</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {revenueOption && (
                <ReactECharts
                  option={revenueOption}
                  style={{ height: "320px", width: "100%" }}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {bookingOption && (
                <ReactECharts
                  option={bookingOption}
                  style={{ height: "320px", width: "100%" }}
                />
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  Đặt Phòng Gần Đây
                </h2>
                <a
                  href="/admin/bookingsManagement"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Xem tất cả
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã Đặt Phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách Hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách Sạn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in / Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Chưa có đặt phòng nào
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => {
                      const nights = booking.check_in && booking.check_out
                        ? Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))
                        : 0;
                      
                      const statusColors = {
                        pending: "bg-yellow-100 text-yellow-800",
                        confirmed: "bg-green-100 text-green-800",
                        paid: "bg-blue-100 text-blue-800",
                        cancelled: "bg-red-100 text-red-800",
                      };

                      const statusLabels = {
                        pending: "Đang chờ",
                        confirmed: "Đã xác nhận",
                        paid: "Đã thanh toán",
                        cancelled: "Đã hủy",
                      };

                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{booking.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800">
                                <span className="text-sm font-medium">
                                  {getInitials(booking.user_name)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.user_name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.user_email || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.hotel_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.rooms && booking.rooms[0] 
                                ? booking.rooms[0].room_name 
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.check_in && booking.check_out
                                ? `${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}`
                                : "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {nights > 0 ? `${nights} đêm` : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.total_price || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusColors[booking.status] || "bg-gray-100 text-gray-800"
                            }`}>
                              {statusLabels[booking.status] || booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openDetailModal(booking)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hoạt động gần đây */}
           <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                      Hoạt Động Gần Đây
                    </h2>
                    <a
                      href="#"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Xem tất cả
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <li>
                        <div className="relative pb-8">
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                <i className="fas fa-user-plus text-white"></i>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    Nguyễn Văn A
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Đã đăng ký tài khoản mới
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>15 phút trước</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      <li>
                        <div className="relative pb-8">
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                <i className="fas fa-calendar-check text-white"></i>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    Trần Lan B
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Đã đặt phòng tại Khách Sạn Phương Nam
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>1 giờ trước</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      <li>
                        <div className="relative pb-8">
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
                                <i className="fas fa-times text-white"></i>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    Lê Hoàng C
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Đã hủy đặt phòng tại Khách Sạn Hoàng Gia
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>2 giờ trước</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      <li>
                        <div className="relative pb-8">
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                                <i className="fas fa-star text-white"></i>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    Phạm Thị D
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Đã đánh giá 5 sao cho Khách Sạn Đông Phương
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>3 giờ trước</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      <li>
                        <div className="relative">
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <i className="fas fa-money-bill-wave text-white"></i>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    Hoàng Minh E
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Đã thanh toán đặt phòng tại Khách Sạn Phương
                                  Nam
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>4 giờ trước</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div> 
      </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Booking #{selectedBooking.id}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      {selectedBooking.user_name || `User #${selectedBooking.user_id}`}
                    </span>
                    {selectedBooking.user_email && (
                      <span className="flex items-center">
                        <i className="fas fa-envelope mr-2"></i>
                        {selectedBooking.user_email || selectedBooking.email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4">
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Booking Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-calendar-alt mr-2 text-indigo-700"></i>
                  Thông tin đặt phòng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID Booking</p>
                    <p className="font-medium text-gray-900">#{selectedBooking.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {Number(selectedBooking.total_price).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="font-medium text-gray-900">{formatDateDetail(selectedBooking.check_in)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="font-medium text-gray-900">{formatDateDetail(selectedBooking.check_out)}</p>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              {selectedBooking.rooms && selectedBooking.rooms.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-bed mr-2 text-indigo-700"></i>
                    Phòng đã đặt
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.rooms.map((room, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="font-medium text-gray-900">{room.room_name || `Phòng #${room.room_id}`}</p>
                        {room.room_price && (
                          <p className="text-sm text-gray-600">
                            Giá: {Number(room.room_price).toLocaleString("vi-VN")} VNĐ
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="mb-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-user-circle mr-2 text-indigo-700"></i>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tên</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user_name || `User #${selectedBooking.user_id}`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user_email || selectedBooking.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hotel Info */}
              {selectedBooking.hotel_name && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-hotel mr-2 text-indigo-700"></i>
                    Thông tin khách sạn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tên khách sạn</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.hotel_name}
                      </p>
                    </div>
                    {selectedBooking.hotel_address && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.hotel_address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {selectedBooking.status === "cancelled" && selectedBooking.cancellation_reason && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-exclamation-triangle mr-2 text-red-700"></i>
                    Lý do hủy
                  </h3>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedBooking.cancellation_reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;
