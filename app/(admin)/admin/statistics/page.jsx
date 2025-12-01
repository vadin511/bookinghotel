"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import ReactECharts from "echarts-for-react";

const HotelStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [hotelStats, setHotelStats] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [periodInfo, setPeriodInfo] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const router = useRouter();

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Fetch overview stats
  useEffect(() => {
    const fetchOverviewStats = async () => {
      if (!startDate || !endDate) return;
      
      try {
        const url = `/api/dashboard/stats?start_date=${startDate}&end_date=${endDate}${selectedHotelId !== "all" ? `&hotel_id=${selectedHotelId}` : ""}`;
        const res = await fetch(url, {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          const errorData = await res.json().catch(() => ({ message: "Failed to fetch overview stats" }));
          throw new Error(errorData.message || "Failed to fetch overview stats");
        }
        const data = await res.json();
        setOverviewStats(data);
        setPeriodInfo({
          startDate: data.periodRange?.startDate,
          endDate: data.periodRange?.endDate,
        });
      } catch (error) {
        console.error("Error fetching overview stats:", error);
        // Có thể thêm toast notification ở đây nếu cần
      }
    };

    fetchOverviewStats();
  }, [router, startDate, endDate, selectedHotelId]);

  // Fetch hotel stats
  useEffect(() => {
    const fetchHotelStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/hotels?start_date=${startDate}&end_date=${endDate}`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch hotel stats");
        }
        const data = await res.json();
        setHotelStats(data.hotels || []);
      } catch (error) {
        console.error("Error fetching hotel stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchHotelStats();
    }
  }, [router, startDate, endDate]);

  // Fetch all hotels for filter dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("/api/hotel", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch hotels");
        }
        const data = await res.json();
        setAllHotels(data || []);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, []);

  // Filter hotel stats based on selected hotel and search query
  const filteredHotelStats = hotelStats.filter((hotel) => {
    // Filter by selected hotel
    if (selectedHotelId !== "all" && hotel.id !== parseInt(selectedHotelId)) {
      return false;
    }

    // Filter by search query (name or address)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = hotel.name?.toLowerCase().includes(query);
      const matchesAddress = hotel.address?.toLowerCase().includes(query);
      return matchesName || matchesAddress;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Loading message="Đang tải dữ liệu..." color="indigo" />
      </div>
    );
  }

  // Chart options
  const revenueOption = overviewStats?.charts
    ? {
        animation: false,
        title: {
          text: `Doanh Thu ${overviewStats.charts?.label || ""}`,
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
          data: overviewStats.charts?.labels || [],
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
            data: overviewStats.charts?.revenue || [],
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

  const bookingOption = overviewStats?.charts
    ? {
        animation: false,
        title: {
          text: `Số Lượng Đặt Phòng ${overviewStats.charts?.label || ""}`,
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
          data: overviewStats.charts?.labels || [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: overviewStats.charts?.bookings || [],
            type: "bar",
            itemStyle: {
              color: "#10B981",
            },
          },
        ],
      }
    : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Thống Kê Khách Sạn</h1>
        </div>

        {/* Filter và Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Date range picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-calendar-alt mr-2"></i>
                Chọn khoảng thời gian
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <label className="text-xs text-gray-500 mt-1 block">Từ ngày</label>
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <label className="text-xs text-gray-500 mt-1 block">Đến ngày</label>
                </div>
              </div>
              {periodInfo && (
                <div className="mt-2 text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  {periodInfo.startDate} - {periodInfo.endDate}
                </div>
              )}
            </div>

            {/* Dropdown lọc theo khách sạn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-filter mr-2"></i>
                Lọc theo khách sạn
              </label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả khách sạn</option>
                {allHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-search mr-2"></i>
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc địa chỉ khách sạn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan thống kê */}
        {overviewStats && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tổng Quan {selectedHotelId !== "all" ? `- ${allHotels.find(h => h.id === parseInt(selectedHotelId))?.name || ""}` : "Của Sàn"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">
                      Tổng Doanh Thu
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {formatCurrency(overviewStats.stats.totalRevenue)}
                    </h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      overviewStats.stats.revenueChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${overviewStats.stats.revenueChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(overviewStats.stats.revenueChange)}% so với kỳ trước</span>
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
                    <h3 className="text-2xl font-bold mt-1">{overviewStats.stats.totalBookings}</h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      overviewStats.stats.bookingsChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${overviewStats.stats.bookingsChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(overviewStats.stats.bookingsChange)}% so với kỳ trước</span>
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
                      {overviewStats.stats.occupancyRate}%
                    </h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      overviewStats.stats.occupancyChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${overviewStats.stats.occupancyChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(overviewStats.stats.occupancyChange)}% so với kỳ trước</span>
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
                    <h3 className="text-2xl font-bold mt-1">{overviewStats.stats.newUsers}</h3>
                    <p className={`text-sm mt-1 flex items-center ${
                      overviewStats.stats.usersChange >= 0 ? "text-green-200" : "text-red-200"
                    }`}>
                      <i className={`fas fa-arrow-${overviewStats.stats.usersChange >= 0 ? "up" : "down"} mr-1`}></i>
                      <span>{Math.abs(overviewStats.stats.usersChange)}% so với kỳ trước</span>
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {overviewStats && (
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
        )}

        {/* Thống kê theo từng khách sạn */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Chi Tiết Thống Kê Khách Sạn
                </h2>
                {periodInfo && (
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-calendar mr-1"></i>
                    {periodInfo.startDate} - {periodInfo.endDate}
                  </p>
                )}
              </div>
              {filteredHotelStats.length > 0 && (
                <span className="text-sm text-gray-500">
                  {filteredHotelStats.length} khách sạn
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách Sạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thay Đổi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đặt Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thay Đổi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ Lệ Lấp Đầy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Đặt Phòng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotelStats.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      {hotelStats.length === 0 
                        ? "Chưa có dữ liệu khách sạn"
                        : "Không tìm thấy khách sạn nào phù hợp với bộ lọc"}
                    </td>
                  </tr>
                ) : (
                  filteredHotelStats.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hotel.address}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {hotel.totalRooms} phòng
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(hotel.currentPeriodRevenue || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm flex items-center ${
                          hotel.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          <i className={`fas fa-arrow-${hotel.revenueChange >= 0 ? "up" : "down"} mr-1 text-xs`}></i>
                          {Math.abs(hotel.revenueChange)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.currentPeriodBookings || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm flex items-center ${
                          hotel.bookingsChange >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          <i className={`fas fa-arrow-${hotel.bookingsChange >= 0 ? "up" : "down"} mr-1 text-xs`}></i>
                          {Math.abs(hotel.bookingsChange)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.occupancyRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(hotel.totalRevenue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.totalBookings}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelStatistics;

