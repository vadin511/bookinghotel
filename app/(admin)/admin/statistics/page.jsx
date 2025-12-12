"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import ReactECharts from "echarts-for-react";

const HotelStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [hotelStats, setHotelStats] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [selectedDate, setSelectedDate] = useState(null); // null hoặc YYYY-MM-DD
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // "name", "revenue", "bookings"
  const [periodInfo, setPeriodInfo] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const router = useRouter();

  // Tính toán startDate và endDate - ưu tiên selectedDate, nếu không có thì dùng selectedMonth
  const { startDate, endDate } = useMemo(() => {
    // Format date theo local time để tránh timezone issues
    const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Nếu có chọn ngày cụ thể, dùng ngày đó cho cả startDate và endDate
    if (selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dateStr = formatDateLocal(dateObj);
      return {
        startDate: dateStr,
        endDate: dateStr
      };
    }

    // Nếu không có chọn ngày, dùng tháng
    if (!selectedMonth) return { startDate: null, endDate: null };
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDateObj = new Date(year, month - 1, 1);
    const endDateObj = new Date(year, month, 0); // Ngày cuối cùng của tháng
    
    return {
      startDate: formatDateLocal(startDateObj),
      endDate: formatDateLocal(endDateObj)
    };
  }, [selectedMonth, selectedDate]);

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
      if (!startDate || !endDate) return;
      
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

    fetchHotelStats();
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

  // Filter và sắp xếp hotel stats
  const filteredHotelStats = hotelStats
    .filter((hotel) => {
      // Filter by selected hotel
      if (selectedHotelId !== "all" && hotel.id !== parseInt(selectedHotelId)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          // Sắp xếp theo doanh thu cao nhất (currentPeriodRevenue)
          return (b.currentPeriodRevenue || 0) - (a.currentPeriodRevenue || 0);
        case "bookings":
          // Sắp xếp theo số lượng đặt phòng cao nhất (totalBookings)
          return (b.totalBookings || 0) - (a.totalBookings || 0);
        case "name":
        default:
          // Sắp xếp theo tên khách sạn (A-Z)
          return (a.name || "").localeCompare(b.name || "");
      }
    });

  // Filter hotels for dropdown based on search query
  const filteredHotelsForDropdown = allHotels.filter((hotel) => {
    if (!hotelSearchQuery) return true;
    const query = hotelSearchQuery.toLowerCase();
    const matchesName = hotel.name?.toLowerCase().includes(query);
    const matchesAddress = hotel.address?.toLowerCase().includes(query);
    return matchesName || matchesAddress;
  });

  // Handle hotel selection
  const handleHotelSelect = (hotelId) => {
    setSelectedHotelId(hotelId);
    if (hotelId === "all") {
      setHotelSearchQuery("");
    } else {
      const selectedHotel = allHotels.find(h => h.id === parseInt(hotelId));
      setHotelSearchQuery(selectedHotel?.name || "");
    }
    setShowHotelDropdown(false);
  };

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

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Month picker và Date picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Chọn tháng
                </label>
                <button
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    if (showDatePicker) {
                      setSelectedDate(null);
                    }
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <i className="fas fa-calendar-day mr-1"></i>
                  Chọn ngày
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate(null); // Xóa lọc ngày khi chọn tháng mới
                  }}
                  max={new Date().toISOString().slice(0, 7)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {showDatePicker && (
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate || ""}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => {
                          setSelectedDate(null);
                          setShowDatePicker(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {periodInfo && (
                <div className="mt-2 text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  {selectedDate 
                    ? `Ngày ${periodInfo.startDate}`
                    : `Từ ngày ${periodInfo.startDate} - ${periodInfo.endDate}`
                  }
                </div>
              )}
            </div>

            {/* Combobox lọc theo khách sạn */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-filter mr-2"></i>
                Lọc theo khách sạn
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chọn hoặc nhập tên khách sạn..."
                  value={hotelSearchQuery}
                  onChange={(e) => {
                    setHotelSearchQuery(e.target.value);
                    setShowHotelDropdown(true);
                    if (!e.target.value) {
                      setSelectedHotelId("all");
                    }
                  }}
                  onFocus={() => setShowHotelDropdown(true)}
                  onBlur={() => {
                    // Delay để cho phép click vào dropdown
                    setTimeout(() => setShowHotelDropdown(false), 200);
                  }}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    setHotelSearchQuery("");
                    setSelectedHotelId("all");
                    setShowHotelDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
                {showHotelDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent onBlur from firing
                        handleHotelSelect("all");
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        selectedHotelId === "all" ? "bg-indigo-50 text-indigo-600" : ""
                      }`}
                    >
                      Tất cả khách sạn
                    </div>
                    {filteredHotelsForDropdown.map((hotel) => (
                      <div
                        key={hotel.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent onBlur from firing
                          handleHotelSelect(hotel.id.toString());
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          selectedHotelId === hotel.id.toString() ? "bg-indigo-50 text-indigo-600" : ""
                        }`}
                      >
                        <div className="font-medium">{hotel.name}</div>
                        <div className="text-xs text-gray-500">{hotel.address}</div>
                      </div>
                    ))}
                    {filteredHotelsForDropdown.length === 0 && (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        Không tìm thấy khách sạn
                      </div>
                    )}
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">
                      Tổng Doanh Thu
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {formatCurrency(overviewStats.stats.totalRevenue)}
                    </h3>
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
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white text-xl"></i>
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
            <div className="flex items-center justify-between mb-4">
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
            
            {/* Phần sắp xếp */}
            {filteredHotelStats.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">
                  <i className="fas fa-sort mr-2"></i>
                  Sắp xếp theo:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("name")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      sortBy === "name"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <i className="fas fa-hotel mr-1"></i>
                    Khách sạn
                  </button>
                  <button
                    onClick={() => setSortBy("revenue")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      sortBy === "revenue"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <i className="fas fa-money-bill-wave mr-1"></i>
                    Doanh thu cao nhất
                  </button>
                  <button
                    onClick={() => setSortBy("bookings")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      sortBy === "bookings"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <i className="fas fa-calendar-check mr-1"></i>
                    Số lượng đặt phòng cao nhất
                  </button>
                </div>
              </div>
            )}
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
                    Tổng Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số Lượng Phòng Đặt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotelStats.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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

