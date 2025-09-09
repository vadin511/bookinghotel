"use client";

const HomeDashboard = () => {
  // const [activeTab, setActiveTab] = useState("dashboard");

  // useEffect(() => {
  //   // Initialize charts
  //   const revenueChart = echarts.init(document.getElementById("revenue-chart"));
  //   const bookingChart = echarts.init(document.getElementById("booking-chart"));

  //   const revenueOption = {
  //     animation: false,
  //     title: {
  //       text: "Doanh Thu Theo Tháng",
  //       left: "center",
  //       textStyle: {
  //         fontSize: 14,
  //       },
  //     },
  //     tooltip: {
  //       trigger: "axis",
  //     },
  //     xAxis: {
  //       type: "category",
  //       data: [
  //         "T1",
  //         "T2",
  //         "T3",
  //         "T4",
  //         "T5",
  //         "T6",
  //         "T7",
  //         "T8",
  //         "T9",
  //         "T10",
  //         "T11",
  //         "T12",
  //       ],
  //     },
  //     yAxis: {
  //       type: "value",
  //     },
  //     series: [
  //       {
  //         data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
  //         type: "line",
  //         smooth: true,
  //         lineStyle: {
  //           color: "#4F46E5",
  //         },
  //         areaStyle: {
  //           color: {
  //             type: "linear",
  //             x: 0,
  //             y: 0,
  //             x2: 0,
  //             y2: 1,
  //             colorStops: [
  //               { offset: 0, color: "rgba(79, 70, 229, 0.4)" },
  //               { offset: 1, color: "rgba(79, 70, 229, 0.1)" },
  //             ],
  //           },
  //         },
  //       },
  //     ],
  //   };

  //   const bookingOption = {
  //     animation: false,
  //     title: {
  //       text: "Số Lượng Đặt Phòng",
  //       left: "center",
  //       textStyle: {
  //         fontSize: 14,
  //       },
  //     },
  //     tooltip: {
  //       trigger: "axis",
  //     },
  //     xAxis: {
  //       type: "category",
  //       data: [
  //         "T1",
  //         "T2",
  //         "T3",
  //         "T4",
  //         "T5",
  //         "T6",
  //         "T7",
  //         "T8",
  //         "T9",
  //         "T10",
  //         "T11",
  //         "T12",
  //       ],
  //     },
  //     yAxis: {
  //       type: "value",
  //     },
  //     series: [
  //       {
  //         data: [82, 93, 90, 93, 129, 133, 132, 148, 122, 110, 134, 156],
  //         type: "bar",
  //         itemStyle: {
  //           color: "#10B981",
  //         },
  //       },
  //     ],
  //   };

  //   revenueChart.setOption(revenueOption);
  //   bookingChart.setOption(bookingOption);

  //   const handleResize = () => {
  //     revenueChart.resize();
  //     bookingChart.resize();
  //   };

  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //     revenueChart.dispose();
  //     bookingChart.dispose();
  //   };
  // }, []);

  return (
    <div></div>
    // <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
    //   {activeTab === "dashboard" && (
    //     // <div>
    //     //   <div className="flex items-center justify-between mb-8">
    //     //     <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
    //     //     <div className="flex space-x-2">
    //     //       <div className="relative">
    //     //         <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
    //     //           <i className="fas fa-calendar-alt"></i>
    //     //           <span>17/05/2025 - Hôm nay</span>
    //     //           <i className="fas fa-chevron-down text-xs"></i>
    //     //         </button>
    //     //       </div>
    //     //       <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer !rounded-button whitespace-nowrap">
    //     //         <i className="fas fa-download mr-2"></i>
    //     //         Xuất báo cáo
    //     //       </button>
    //     //     </div>
    //     //   </div>

    //     //   {/* Stats Cards */}
    //     //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div className="flex items-center justify-between">
    //     //         <div>
    //     //           <p className="text-sm font-medium text-gray-500">
    //     //             Tổng Doanh Thu
    //     //           </p>
    //     //           <h3 className="text-2xl font-bold text-gray-900 mt-1">
    //     //             3.456.789.000 đ
    //     //           </h3>
    //     //           <p className="text-sm text-green-600 mt-1 flex items-center">
    //     //             <i className="fas fa-arrow-up mr-1"></i>
    //     //             <span>12.5% so với tháng trước</span>
    //     //           </p>
    //     //         </div>
    //     //         <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
    //     //           <i className="fas fa-money-bill-wave text-indigo-600 text-xl"></i>
    //     //         </div>
    //     //       </div>
    //     //     </div>

    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div className="flex items-center justify-between">
    //     //         <div>
    //     //           <p className="text-sm font-medium text-gray-500">Đặt Phòng</p>
    //     //           <h3 className="text-2xl font-bold text-gray-900 mt-1">256</h3>
    //     //           <p className="text-sm text-green-600 mt-1 flex items-center">
    //     //             <i className="fas fa-arrow-up mr-1"></i>
    //     //             <span>8.3% so với tháng trước</span>
    //     //           </p>
    //     //         </div>
    //     //         <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
    //     //           <i className="fas fa-calendar-check text-green-600 text-xl"></i>
    //     //         </div>
    //     //       </div>
    //     //     </div>

    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div className="flex items-center justify-between">
    //     //         <div>
    //     //           <p className="text-sm font-medium text-gray-500">
    //     //             Tỷ Lệ Lấp Đầy
    //     //           </p>
    //     //           <h3 className="text-2xl font-bold text-gray-900 mt-1">
    //     //             78.5%
    //     //           </h3>
    //     //           <p className="text-sm text-red-600 mt-1 flex items-center">
    //     //             <i className="fas fa-arrow-down mr-1"></i>
    //     //             <span>3.2% so với tháng trước</span>
    //     //           </p>
    //     //         </div>
    //     //         <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
    //     //           <i className="fas fa-bed text-blue-600 text-xl"></i>
    //     //         </div>
    //     //       </div>
    //     //     </div>

    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div className="flex items-center justify-between">
    //     //         <div>
    //     //           <p className="text-sm font-medium text-gray-500">
    //     //             Khách Hàng Mới
    //     //           </p>
    //     //           <h3 className="text-2xl font-bold text-gray-900 mt-1">124</h3>
    //     //           <p className="text-sm text-green-600 mt-1 flex items-center">
    //     //             <i className="fas fa-arrow-up mr-1"></i>
    //     //             <span>18.7% so với tháng trước</span>
    //     //           </p>
    //     //         </div>
    //     //         <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
    //     //           <i className="fas fa-users text-yellow-600 text-xl"></i>
    //     //         </div>
    //     //       </div>
    //     //     </div>
    //     //   </div>

    //     //   {/* Charts */}
    //     //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div id="revenue-chart" className="h-80 w-full"></div>
    //     //     </div>

    //     //     <div className="bg-white rounded-lg shadow-sm p-6">
    //     //       <div id="booking-chart" className="h-80 w-full"></div>
    //     //     </div>
    //     //   </div>

    //     //   {/* Recent Bookings */}
    //     //   <div className="bg-white rounded-lg shadow-sm mb-8">
    //     //     <div className="p-6 border-b">
    //     //       <div className="flex items-center justify-between">
    //     //         <h2 className="text-lg font-bold text-gray-800">
    //     //           Đặt Phòng Gần Đây
    //     //         </h2>
    //     //         <a
    //     //           href="#"
    //     //           className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    //     //         >
    //     //           Xem tất cả
    //     //         </a>
    //     //       </div>
    //     //     </div>

    //     //     <div className="overflow-x-auto">
    //     //       <table className="w-full">
    //     //         <thead>
    //     //           <tr className="bg-gray-50">
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Mã Đặt Phòng
    //     //             </th>
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Khách Hàng
    //     //             </th>
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Khách Sạn
    //     //             </th>
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Check-in / Check-out
    //     //             </th>
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Tổng Tiền
    //     //             </th>
    //     //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Trạng Thái
    //     //             </th>
    //     //             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
    //     //               Thao Tác
    //     //             </th>
    //     //           </tr>
    //     //         </thead>
    //     //         <tbody className="bg-white divide-y divide-gray-200">
    //     //           <tr>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 #BK-12345
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">17/05/2025</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="flex items-center">
    //     //                 <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800">
    //     //                   <span className="text-sm font-medium">NV</span>
    //     //                 </div>
    //     //                 <div className="ml-3">
    //     //                   <div className="text-sm font-medium text-gray-900">
    //     //                     Nguyễn Văn A
    //     //                   </div>
    //     //                   <div className="text-sm text-gray-500">
    //     //                     nguyenvana@gmail.com
    //     //                   </div>
    //     //                 </div>
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 Khách Sạn Hoàng Gia
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">Phòng Deluxe</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 18/05/2025 - 20/05/2025
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">2 đêm</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 2.400.000 đ
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
    //     //                 Đã xác nhận
    //     //               </span>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //     //               <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-eye"></i>
    //     //               </button>
    //     //               <button className="text-gray-600 hover:text-gray-900 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-ellipsis-v"></i>
    //     //               </button>
    //     //             </td>
    //     //           </tr>
    //     //           <tr>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 #BK-12344
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">16/05/2025</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="flex items-center">
    //     //                 <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800">
    //     //                   <span className="text-sm font-medium">TL</span>
    //     //                 </div>
    //     //                 <div className="ml-3">
    //     //                   <div className="text-sm font-medium text-gray-900">
    //     //                     Trần Lan B
    //     //                   </div>
    //     //                   <div className="text-sm text-gray-500">
    //     //                     tranlanb@gmail.com
    //     //                   </div>
    //     //                 </div>
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 Khách Sạn Phương Nam
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">Phòng Suite</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 20/05/2025 - 25/05/2025
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">5 đêm</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 8.500.000 đ
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
    //     //                 Đang chờ
    //     //               </span>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //     //               <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-eye"></i>
    //     //               </button>
    //     //               <button className="text-gray-600 hover:text-gray-900 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-ellipsis-v"></i>
    //     //               </button>
    //     //             </td>
    //     //           </tr>
    //     //           <tr>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 #BK-12343
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">15/05/2025</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="flex items-center">
    //     //                 <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
    //     //                   <span className="text-sm font-medium">LH</span>
    //     //                 </div>
    //     //                 <div className="ml-3">
    //     //                   <div className="text-sm font-medium text-gray-900">
    //     //                     Lê Hoàng C
    //     //                   </div>
    //     //                   <div className="text-sm text-gray-500">
    //     //                     lehoangc@gmail.com
    //     //                   </div>
    //     //                 </div>
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 Khách Sạn Hoàng Gia
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">
    //     //                 Phòng Standard
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 16/05/2025 - 17/05/2025
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">1 đêm</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 900.000 đ
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
    //     //                 Đã hủy
    //     //               </span>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //     //               <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-eye"></i>
    //     //               </button>
    //     //               <button className="text-gray-600 hover:text-gray-900 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-ellipsis-v"></i>
    //     //               </button>
    //     //             </td>
    //     //           </tr>
    //     //           <tr>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 #BK-12342
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">15/05/2025</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="flex items-center">
    //     //                 <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
    //     //                   <span className="text-sm font-medium">PT</span>
    //     //                 </div>
    //     //                 <div className="ml-3">
    //     //                   <div className="text-sm font-medium text-gray-900">
    //     //                     Phạm Thị D
    //     //                   </div>
    //     //                   <div className="text-sm text-gray-500">
    //     //                     phamthid@gmail.com
    //     //                   </div>
    //     //                 </div>
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 Khách Sạn Đông Phương
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">Phòng Deluxe</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 18/05/2025 - 22/05/2025
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">4 đêm</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 5.600.000 đ
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
    //     //                 Đã xác nhận
    //     //               </span>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //     //               <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-eye"></i>
    //     //               </button>
    //     //               <button className="text-gray-600 hover:text-gray-900 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-ellipsis-v"></i>
    //     //               </button>
    //     //             </td>
    //     //           </tr>
    //     //           <tr>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 #BK-12341
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">14/05/2025</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="flex items-center">
    //     //                 <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
    //     //                   <span className="text-sm font-medium">HM</span>
    //     //                 </div>
    //     //                 <div className="ml-3">
    //     //                   <div className="text-sm font-medium text-gray-900">
    //     //                     Hoàng Minh E
    //     //                   </div>
    //     //                   <div className="text-sm text-gray-500">
    //     //                     hoangminhe@gmail.com
    //     //                   </div>
    //     //                 </div>
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 Khách Sạn Phương Nam
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">
    //     //                 Phòng Standard
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm text-gray-900">
    //     //                 17/05/2025 - 19/05/2025
    //     //               </div>
    //     //               <div className="text-sm text-gray-500">2 đêm</div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <div className="text-sm font-medium text-gray-900">
    //     //                 1.800.000 đ
    //     //               </div>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap">
    //     //               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
    //     //                 Đã xác nhận
    //     //               </span>
    //     //             </td>
    //     //             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //     //               <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-eye"></i>
    //     //               </button>
    //     //               <button className="text-gray-600 hover:text-gray-900 cursor-pointer !rounded-button whitespace-nowrap">
    //     //                 <i className="fas fa-ellipsis-v"></i>
    //     //               </button>
    //     //             </td>
    //     //           </tr>
    //     //         </tbody>
    //     //       </table>
    //     //     </div>
    //     //   </div>

    //       {/* Hoạt động gần đây */}
    //       {/* <div className="bg-white rounded-lg shadow-sm">
    //             <div className="p-6 border-b">
    //               <div className="flex items-center justify-between">
    //                 <h2 className="text-lg font-bold text-gray-800">
    //                   Hoạt Động Gần Đây
    //                 </h2>
    //                 <a
    //                   href="#"
    //                   className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    //                 >
    //                   Xem tất cả
    //                 </a>
    //               </div>
    //             </div>

    //             <div className="p-6">
    //               <div className="flow-root">
    //                 <ul className="-mb-8">
    //                   <li>
    //                     <div className="relative pb-8">
    //                       <span
    //                         className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
    //                         aria-hidden="true"
    //                       ></span>
    //                       <div className="relative flex items-start space-x-3">
    //                         <div className="relative">
    //                           <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
    //                             <i className="fas fa-user-plus text-white"></i>
    //                           </div>
    //                         </div>
    //                         <div className="min-w-0 flex-1">
    //                           <div>
    //                             <div className="text-sm">
    //                               <a
    //                                 href="#"
    //                                 className="font-medium text-gray-900"
    //                               >
    //                                 Nguyễn Văn A
    //                               </a>
    //                             </div>
    //                             <p className="mt-0.5 text-sm text-gray-500">
    //                               Đã đăng ký tài khoản mới
    //                             </p>
    //                           </div>
    //                           <div className="mt-2 text-sm text-gray-500">
    //                             <p>15 phút trước</p>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </li>

    //                   <li>
    //                     <div className="relative pb-8">
    //                       <span
    //                         className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
    //                         aria-hidden="true"
    //                       ></span>
    //                       <div className="relative flex items-start space-x-3">
    //                         <div className="relative">
    //                           <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
    //                             <i className="fas fa-calendar-check text-white"></i>
    //                           </div>
    //                         </div>
    //                         <div className="min-w-0 flex-1">
    //                           <div>
    //                             <div className="text-sm">
    //                               <a
    //                                 href="#"
    //                                 className="font-medium text-gray-900"
    //                               >
    //                                 Trần Lan B
    //                               </a>
    //                             </div>
    //                             <p className="mt-0.5 text-sm text-gray-500">
    //                               Đã đặt phòng tại Khách Sạn Phương Nam
    //                             </p>
    //                           </div>
    //                           <div className="mt-2 text-sm text-gray-500">
    //                             <p>1 giờ trước</p>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </li>

    //                   <li>
    //                     <div className="relative pb-8">
    //                       <span
    //                         className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
    //                         aria-hidden="true"
    //                       ></span>
    //                       <div className="relative flex items-start space-x-3">
    //                         <div className="relative">
    //                           <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
    //                             <i className="fas fa-times text-white"></i>
    //                           </div>
    //                         </div>
    //                         <div className="min-w-0 flex-1">
    //                           <div>
    //                             <div className="text-sm">
    //                               <a
    //                                 href="#"
    //                                 className="font-medium text-gray-900"
    //                               >
    //                                 Lê Hoàng C
    //                               </a>
    //                             </div>
    //                             <p className="mt-0.5 text-sm text-gray-500">
    //                               Đã hủy đặt phòng tại Khách Sạn Hoàng Gia
    //                             </p>
    //                           </div>
    //                           <div className="mt-2 text-sm text-gray-500">
    //                             <p>2 giờ trước</p>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </li>

    //                   <li>
    //                     <div className="relative pb-8">
    //                       <span
    //                         className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
    //                         aria-hidden="true"
    //                       ></span>
    //                       <div className="relative flex items-start space-x-3">
    //                         <div className="relative">
    //                           <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
    //                             <i className="fas fa-star text-white"></i>
    //                           </div>
    //                         </div>
    //                         <div className="min-w-0 flex-1">
    //                           <div>
    //                             <div className="text-sm">
    //                               <a
    //                                 href="#"
    //                                 className="font-medium text-gray-900"
    //                               >
    //                                 Phạm Thị D
    //                               </a>
    //                             </div>
    //                             <p className="mt-0.5 text-sm text-gray-500">
    //                               Đã đánh giá 5 sao cho Khách Sạn Đông Phương
    //                             </p>
    //                           </div>
    //                           <div className="mt-2 text-sm text-gray-500">
    //                             <p>3 giờ trước</p>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </li>

    //                   <li>
    //                     <div className="relative">
    //                       <div className="relative flex items-start space-x-3">
    //                         <div className="relative">
    //                           <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
    //                             <i className="fas fa-money-bill-wave text-white"></i>
    //                           </div>
    //                         </div>
    //                         <div className="min-w-0 flex-1">
    //                           <div>
    //                             <div className="text-sm">
    //                               <a
    //                                 href="#"
    //                                 className="font-medium text-gray-900"
    //                               >
    //                                 Hoàng Minh E
    //                               </a>
    //                             </div>
    //                             <p className="mt-0.5 text-sm text-gray-500">
    //                               Đã thanh toán đặt phòng tại Khách Sạn Phương
    //                               Nam
    //                             </p>
    //                           </div>
    //                           <div className="mt-2 text-sm text-gray-500">
    //                             <p>4 giờ trước</p>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </div>
    //           </div> */}
    //     // </div>
    //   )}
    // </div>
  );
};

export default HomeDashboard;
