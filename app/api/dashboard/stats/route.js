// app/api/dashboard/stats/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

// Hàm tính toán khoảng thời gian theo filter (copy từ hotels route)
function getTimeRange(filter) {
  const now = new Date();
  let startDate, endDate, previousStartDate, previousEndDate, periodLabel;

  switch (filter) {
    case 'week': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      startDate = monday;
      endDate = sunday;
      
      const lastMonday = new Date(monday);
      lastMonday.setDate(monday.getDate() - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      lastSunday.setHours(23, 59, 59, 999);
      
      previousStartDate = lastMonday;
      previousEndDate = lastSunday;
      periodLabel = 'Tuần này';
      break;
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      periodLabel = 'Tháng này';
      break;
    }
    case 'year': {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      periodLabel = 'Năm này';
      break;
    }
    default: {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      periodLabel = 'Tháng này';
    }
  }

  return {
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
    periodLabel,
    daysInPeriod: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  };
}

export async function GET(req) {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Lấy filter từ query parameters
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotel_id');
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');

    let startDate, endDate, previousStartDate, previousEndDate, daysInPeriod;

    if (startDateParam && endDateParam) {
      // Sử dụng date range từ params - parse thủ công để tránh timezone issues
      const [startYear, startMonth, startDay] = startDateParam.split('-').map(Number);
      startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      
      const [endYear, endMonth, endDay] = endDateParam.split('-').map(Number);
      const requestedEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      // Nếu endDate là trong tháng hiện tại và chưa đến ngày cuối tháng, sử dụng ngày hiện tại
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      if (endYear === currentYear && endMonth - 1 === currentMonth && endDay > currentDay) {
        // Tháng hiện tại chưa kết thúc, sử dụng ngày hiện tại
        endDate = new Date(currentYear, currentMonth, currentDay, 23, 59, 59, 999);
      } else {
        endDate = requestedEndDate;
      }
      
      // Tính kỳ trước (cùng độ dài)
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
      previousStartDate.setHours(0, 0, 0, 0);
      
      daysInPeriod = daysDiff + 1;
    } else {
      // Fallback về filter cũ nếu không có date range
      const filter = searchParams.get('filter') || 'month';
      const timeRange = getTimeRange(filter);
      startDate = timeRange.startDate;
      endDate = timeRange.endDate;
      previousStartDate = timeRange.previousStartDate;
      previousEndDate = timeRange.previousEndDate;
      daysInPeriod = timeRange.daysInPeriod;
    }

    // Format dates cho MySQL
    const formatDateForMySQL = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const startDateStr = formatDateForMySQL(startDate);
    const endDateStr = formatDateForMySQL(endDate);
    const previousStartDateStr = formatDateForMySQL(previousStartDate);
    const previousEndDateStr = formatDateForMySQL(previousEndDate);

    // Tổng doanh thu kỳ hiện tại
    let revenueQuery = `
      SELECT COALESCE(SUM(total_price), 0) as total
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= ?
        AND created_at <= ?
    `;
    let revenueParams = [startDateStr, endDateStr];
    
    if (hotelId) {
      revenueQuery += ` AND hotel_id = ?`;
      revenueParams.push(parseInt(hotelId));
    }
    
    const [currentPeriodRevenue] = await db.query(revenueQuery, revenueParams);

    // Tổng doanh thu kỳ trước
    let previousRevenueQuery = `
      SELECT COALESCE(SUM(total_price), 0) as total
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= ?
        AND created_at <= ?
    `;
    let previousRevenueParams = [previousStartDateStr, previousEndDateStr];
    
    if (hotelId) {
      previousRevenueQuery += ` AND hotel_id = ?`;
      previousRevenueParams.push(parseInt(hotelId));
    }
    
    const [previousPeriodRevenue] = await db.query(previousRevenueQuery, previousRevenueParams);

    const currentRevenue = currentPeriodRevenue[0]?.total || 0;
    const previousRevenue = previousPeriodRevenue[0]?.total || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0;

    // Số lượng đặt phòng kỳ hiện tại
    let bookingsQuery = `
      SELECT COUNT(DISTINCT id) as count
      FROM bookings
      WHERE created_at >= ?
        AND created_at <= ?
    `;
    let bookingsParams = [startDateStr, endDateStr];
    
    if (hotelId) {
      bookingsQuery += ` AND hotel_id = ?`;
      bookingsParams.push(parseInt(hotelId));
    }
    
    const [currentPeriodBookings] = await db.query(bookingsQuery, bookingsParams);

    // Số lượng đặt phòng kỳ trước
    let previousBookingsQuery = `
      SELECT COUNT(DISTINCT id) as count
      FROM bookings
      WHERE created_at >= ?
        AND created_at <= ?
    `;
    let previousBookingsParams = [previousStartDateStr, previousEndDateStr];
    
    if (hotelId) {
      previousBookingsQuery += ` AND hotel_id = ?`;
      previousBookingsParams.push(parseInt(hotelId));
    }
    
    const [previousPeriodBookings] = await db.query(previousBookingsQuery, previousBookingsParams);

    const currentBookings = currentPeriodBookings[0]?.count || 0;
    const previousBookings = previousPeriodBookings[0]?.count || 0;
    const bookingsChange = previousBookings > 0
      ? ((currentBookings - previousBookings) / previousBookings * 100).toFixed(1)
      : currentBookings > 0 ? 100 : 0;

    // Tỷ lệ lấp đầy (Occupancy Rate)
    let occupiedNightsQuery = `
      SELECT SUM(DATEDIFF(check_out, check_in)) as nights
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= ?
        AND created_at <= ?
    `;
    let occupiedNightsParams = [startDateStr, endDateStr];
    
    if (hotelId) {
      occupiedNightsQuery += ` AND hotel_id = ?`;
      occupiedNightsParams.push(parseInt(hotelId));
    }
    
    const [occupiedNights] = await db.query(occupiedNightsQuery, occupiedNightsParams);

    // Lấy tổng số phòng (có thể filter theo hotel)
    let totalRoomsQuery = `SELECT COUNT(*) as count FROM rooms WHERE status = 'available'`;
    let totalRoomsParams = [];
    
    if (hotelId) {
      totalRoomsQuery += ` AND hotel_id = ?`;
      totalRoomsParams.push(parseInt(hotelId));
    }
    
    const [totalRooms] = await db.query(totalRoomsQuery, totalRoomsParams);

    const totalPossibleNights = (totalRooms[0]?.count || 0) * daysInPeriod;
    const occupiedNightsCount = occupiedNights[0]?.nights || 0;
    const occupancyRate = totalPossibleNights > 0
      ? ((occupiedNightsCount / totalPossibleNights) * 100).toFixed(1)
      : 0;

    // Tính occupancy rate kỳ trước để so sánh
    let previousOccupiedNightsQuery = `
      SELECT SUM(DATEDIFF(check_out, check_in)) as nights
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= ?
        AND created_at <= ?
    `;
    let previousOccupiedNightsParams = [previousStartDateStr, previousEndDateStr];
    
    if (hotelId) {
      previousOccupiedNightsQuery += ` AND hotel_id = ?`;
      previousOccupiedNightsParams.push(parseInt(hotelId));
    }
    
    const [previousOccupiedNights] = await db.query(previousOccupiedNightsQuery, previousOccupiedNightsParams);

    const previousDaysInPeriod = Math.ceil((previousEndDate - previousStartDate) / (1000 * 60 * 60 * 24)) + 1;
    const previousTotalPossibleNights = (totalRooms[0]?.count || 0) * previousDaysInPeriod;
    const previousOccupiedNightsCount = previousOccupiedNights[0]?.nights || 0;
    const previousOccupancyRate = previousTotalPossibleNights > 0
      ? ((previousOccupiedNightsCount / previousTotalPossibleNights) * 100)
      : 0;
    
    const occupancyChange = previousOccupancyRate > 0
      ? ((parseFloat(occupancyRate) - previousOccupancyRate) / previousOccupancyRate * 100).toFixed(1)
      : parseFloat(occupancyRate) > 0 ? 100 : 0;

    // Khách hàng mới kỳ hiện tại
    const [currentPeriodUsers] = await db.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ?
        AND created_at <= ?
        AND role = 'user'
    `, [startDateStr, endDateStr]);

    // Khách hàng mới kỳ trước
    const [previousPeriodUsers] = await db.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ?
        AND created_at <= ?
        AND role = 'user'
    `, [previousStartDateStr, previousEndDateStr]);

    const currentUsers = currentPeriodUsers[0]?.count || 0;
    const previousUsers = previousPeriodUsers[0]?.count || 0;
    const usersChange = previousUsers > 0
      ? ((currentUsers - previousUsers) / previousUsers * 100).toFixed(1)
      : currentUsers > 0 ? 100 : 0;

    // Tính toán biểu đồ theo khoảng thời gian
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let chartData, chartLabels, chartLabel;

    // Kiểm tra nếu là tháng hiện tại và chưa kết thúc, luôn hiển thị theo ngày
    const now = new Date();
    const isCurrentMonth = endDate.getFullYear() === now.getFullYear() && 
                           endDate.getMonth() === now.getMonth() &&
                           endDate.getDate() <= now.getDate();

    if (daysDiff <= 30 || isCurrentMonth) {
      // Nếu <= 30 ngày: chia theo ngày
      chartLabel = "Theo Ngày";
      let revenueByDayQuery = `
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE status = 'completed'
          AND created_at >= ?
          AND created_at <= ?
      `;
      let revenueByDayParams = [startDateStr, endDateStr];
      if (hotelId) {
        revenueByDayQuery += ` AND hotel_id = ?`;
        revenueByDayParams.push(parseInt(hotelId));
      }
      revenueByDayQuery += ` GROUP BY DATE(created_at) ORDER BY date`;
      const [revenueByDay] = await db.query(revenueByDayQuery, revenueByDayParams);

      let bookingsByDayQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT id) as count
        FROM bookings
        WHERE created_at >= ?
          AND created_at <= ?
      `;
      let bookingsByDayParams = [startDateStr, endDateStr];
      if (hotelId) {
        bookingsByDayQuery += ` AND hotel_id = ?`;
        bookingsByDayParams.push(parseInt(hotelId));
      }
      bookingsByDayQuery += ` GROUP BY DATE(created_at) ORDER BY date`;
      const [bookingsByDay] = await db.query(bookingsByDayQuery, bookingsByDayParams);

      // Tạo array đầy đủ các ngày - sử dụng local date để tránh timezone issues
      const allDates = [];
      // Tạo date objects từ startDate và endDate để so sánh chính xác
      const startDateForLoop = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      // Đảm bảo không vượt quá ngày hiện tại
      const nowForLoop = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDateForLoop = endDate > nowForLoop ? nowForLoop : new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const currentDate = new Date(startDateForLoop);
      
      while (currentDate <= endDateForLoop) {
        // Format date theo local time, không dùng toISOString để tránh timezone shift
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        allDates.push(`${year}-${month}-${day}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      chartLabels = allDates.map(date => {
        const [year, month, day] = date.split('-').map(Number);
        return `${day}/${month}`;
      });

      // Format dates từ database theo local time
      const formatDateLocal = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const revenueMap = new Map(revenueByDay.map(item => [formatDateLocal(item.date), parseFloat(item.revenue)]));
      const bookingsMap = new Map(bookingsByDay.map(item => [formatDateLocal(item.date), item.count]));

      chartData = {
        revenue: allDates.map(date => revenueMap.get(date) || 0),
        bookings: allDates.map(date => bookingsMap.get(date) || 0),
      };
    } else if (daysDiff <= 90) {
      // Nếu <= 90 ngày: chia theo tuần
      chartLabel = "Theo Tuần";
      let revenueByWeekQuery = `
        SELECT 
          YEAR(created_at) as year,
          WEEK(created_at) as week,
          COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE status = 'completed'
          AND created_at >= ?
          AND created_at <= ?
      `;
      let revenueByWeekParams = [startDateStr, endDateStr];
      if (hotelId) {
        revenueByWeekQuery += ` AND hotel_id = ?`;
        revenueByWeekParams.push(parseInt(hotelId));
      }
      revenueByWeekQuery += ` GROUP BY YEAR(created_at), WEEK(created_at) ORDER BY year, week`;
      const [revenueByWeek] = await db.query(revenueByWeekQuery, revenueByWeekParams);

      let bookingsByWeekQuery = `
        SELECT 
          YEAR(created_at) as year,
          WEEK(created_at) as week,
          COUNT(DISTINCT id) as count
        FROM bookings
        WHERE created_at >= ?
          AND created_at <= ?
      `;
      let bookingsByWeekParams = [startDateStr, endDateStr];
      if (hotelId) {
        bookingsByWeekQuery += ` AND hotel_id = ?`;
        bookingsByWeekParams.push(parseInt(hotelId));
      }
      bookingsByWeekQuery += ` GROUP BY YEAR(created_at), WEEK(created_at) ORDER BY year, week`;
      const [bookingsByWeek] = await db.query(bookingsByWeekQuery, bookingsByWeekParams);

      chartLabels = revenueByWeek.map(item => `Tuần ${item.week}/${item.year}`);
      chartData = {
        revenue: revenueByWeek.map(item => parseFloat(item.revenue)),
        bookings: bookingsByWeek.map(item => item.count),
      };
    } else {
      // Nếu > 90 ngày: chia theo tháng
      chartLabel = "Theo Tháng";
      let revenueByMonthQuery = `
        SELECT 
          MONTH(created_at) as month,
          YEAR(created_at) as year,
          COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE status = 'completed'
          AND created_at >= ?
          AND created_at <= ?
      `;
      let revenueByMonthParams = [startDateStr, endDateStr];
      if (hotelId) {
        revenueByMonthQuery += ` AND hotel_id = ?`;
        revenueByMonthParams.push(parseInt(hotelId));
      }
      revenueByMonthQuery += ` GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY year, month`;
      const [revenueByMonth] = await db.query(revenueByMonthQuery, revenueByMonthParams);

      let bookingsByMonthQuery = `
        SELECT 
          MONTH(created_at) as month,
          YEAR(created_at) as year,
          COUNT(DISTINCT id) as count
        FROM bookings
        WHERE created_at >= ?
          AND created_at <= ?
      `;
      let bookingsByMonthParams = [startDateStr, endDateStr];
      if (hotelId) {
        bookingsByMonthQuery += ` AND hotel_id = ?`;
        bookingsByMonthParams.push(parseInt(hotelId));
      }
      bookingsByMonthQuery += ` GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY year, month`;
      const [bookingsByMonth] = await db.query(bookingsByMonthQuery, bookingsByMonthParams);

      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      chartLabels = revenueByMonth.map(item => `${monthNames[item.month - 1]}/${item.year}`);
      chartData = {
        revenue: revenueByMonth.map(item => parseFloat(item.revenue)),
        bookings: bookingsByMonth.map(item => item.count),
      };
    }

    // Format dates cho response - sử dụng local time
    const formatDateForResponse = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return NextResponse.json({
      hotelId: hotelId ? parseInt(hotelId) : null,
      periodRange: {
        startDate: formatDateForResponse(startDate),
        endDate: formatDateForResponse(endDate),
        previousStartDate: formatDateForResponse(previousStartDate),
        previousEndDate: formatDateForResponse(previousEndDate),
      },
      stats: {
        totalRevenue: currentRevenue,
        revenueChange: parseFloat(revenueChange),
        totalBookings: currentBookings,
        bookingsChange: parseFloat(bookingsChange),
        occupancyRate: parseFloat(occupancyRate),
        occupancyChange: parseFloat(occupancyChange),
        newUsers: currentUsers,
        usersChange: parseFloat(usersChange),
      },
      charts: {
        revenue: chartData.revenue,
        bookings: chartData.bookings,
        labels: chartLabels,
        label: chartLabel,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}













