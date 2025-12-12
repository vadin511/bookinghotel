// app/api/dashboard/hotels/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";

// Hàm tính toán khoảng thời gian theo filter
function getTimeRange(filter) {
  const now = new Date();
  let startDate, endDate, previousStartDate, previousEndDate, periodLabel;

  switch (filter) {
    case 'week': {
      // Tuần hiện tại (Thứ 2 đến Chủ nhật)
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Đưa về thứ 2
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      startDate = monday;
      endDate = sunday;
      
      // Tuần trước
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
      // Tháng hiện tại
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Tháng trước
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      periodLabel = 'Tháng này';
      break;
    }
    case 'year': {
      // Năm hiện tại
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
      // Năm trước
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      periodLabel = 'Năm này';
      break;
    }
    default: {
      // Mặc định là tháng
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
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');
    const filter = searchParams.get('filter');

    let startDate, endDate, previousStartDate, previousEndDate, periodLabel, daysInPeriod;

    if (startDateParam && endDateParam) {
      // Sử dụng date range từ params - parse thủ công để tránh timezone issues
      const [startYear, startMonth, startDay] = startDateParam.split('-').map(Number);
      startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      
      const [endYear, endMonth, endDay] = endDateParam.split('-').map(Number);
      endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      // Tính kỳ trước (cùng độ dài)
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
      previousStartDate.setHours(0, 0, 0, 0);
      
      daysInPeriod = daysDiff + 1;
      periodLabel = `${startDateParam} - ${endDateParam}`;
    } else {
      // Fallback về filter cũ
      const filterValue = filter || 'month';
      const timeRange = getTimeRange(filterValue);
      startDate = timeRange.startDate;
      endDate = timeRange.endDate;
      previousStartDate = timeRange.previousStartDate;
      previousEndDate = timeRange.previousEndDate;
      periodLabel = timeRange.periodLabel;
      daysInPeriod = timeRange.daysInPeriod;
    }

    // Format dates cho MySQL (YYYY-MM-DD HH:MM:SS)
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

    // Lấy thống kê theo từng khách sạn
    // Tách query để tránh nhân đôi khi JOIN với rooms
    const [hotelStats] = await db.query(`
      SELECT 
        h.id,
        h.name,
        h.address,
        h.status,
        -- Số phòng hiện có
        COUNT(DISTINCT r.id) as total_rooms,
        -- Doanh thu kỳ hiện tại (từ subquery để tránh nhân đôi)
        COALESCE((
          SELECT SUM(b2.total_price)
          FROM bookings b2
          WHERE b2.hotel_id = h.id
            AND b2.created_at >= ?
            AND b2.created_at <= ?
            AND b2.status IN ('confirmed', 'paid')
        ), 0) as current_period_revenue,
        -- Doanh thu kỳ trước
        COALESCE((
          SELECT SUM(b3.total_price)
          FROM bookings b3
          WHERE b3.hotel_id = h.id
            AND b3.created_at >= ?
            AND b3.created_at <= ?
            AND b3.status IN ('confirmed', 'paid')
        ), 0) as previous_period_revenue,
        -- Số đặt phòng kỳ hiện tại - đếm DISTINCT để tránh trùng lặp
        COALESCE((
          SELECT COUNT(DISTINCT b4.id)
          FROM bookings b4
          WHERE b4.hotel_id = h.id
            AND b4.created_at >= ?
            AND b4.created_at <= ?
        ), 0) as current_period_bookings,
        -- Số đặt phòng kỳ trước - đếm DISTINCT để tránh trùng lặp
        COALESCE((
          SELECT COUNT(DISTINCT b5.id)
          FROM bookings b5
          WHERE b5.hotel_id = h.id
            AND b5.created_at >= ?
            AND b5.created_at <= ?
        ), 0) as previous_period_bookings,
        -- Tổng doanh thu (trong khoảng thời gian được chọn)
        COALESCE((
          SELECT SUM(b6.total_price)
          FROM bookings b6
          WHERE b6.hotel_id = h.id
            AND b6.created_at >= ?
            AND b6.created_at <= ?
            AND b6.status IN ('confirmed', 'paid')
        ), 0) as total_revenue,
        -- Tổng số đặt phòng (trong khoảng thời gian được chọn) - đếm DISTINCT để tránh trùng lặp
        COALESCE((
          SELECT COUNT(DISTINCT b7.id)
          FROM bookings b7
          WHERE b7.hotel_id = h.id
            AND b7.created_at >= ?
            AND b7.created_at <= ?
        ), 0) as total_bookings,
        -- Số đêm đã đặt kỳ hiện tại
        COALESCE((
          SELECT SUM(DATEDIFF(b8.check_out, b8.check_in))
          FROM bookings b8
          WHERE b8.hotel_id = h.id
            AND b8.created_at >= ?
            AND b8.created_at <= ?
            AND b8.status IN ('confirmed', 'paid')
        ), 0) as occupied_nights
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id AND r.status = 'available'
      GROUP BY h.id, h.name, h.address, h.status
      ORDER BY current_period_revenue DESC
    `, [
      startDateStr, endDateStr,
      previousStartDateStr, previousEndDateStr,
      startDateStr, endDateStr,
      previousStartDateStr, previousEndDateStr,
      startDateStr, endDateStr,
      startDateStr, endDateStr,
      startDateStr, endDateStr
    ]);

    // Tính toán % thay đổi và occupancy rate cho mỗi khách sạn
    const hotelsWithStats = hotelStats.map((hotel) => {
      const currentRevenue = parseFloat(hotel.current_period_revenue) || 0;
      const previousRevenue = parseFloat(hotel.previous_period_revenue) || 0;
      const revenueChange = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : currentRevenue > 0 ? 100 : 0;

      const currentBookings = parseInt(hotel.current_period_bookings) || 0;
      const previousBookings = parseInt(hotel.previous_period_bookings) || 0;
      const bookingsChange = previousBookings > 0
        ? ((currentBookings - previousBookings) / previousBookings * 100).toFixed(1)
        : currentBookings > 0 ? 100 : 0;

      // Tính occupancy rate
      const totalRooms = parseInt(hotel.total_rooms) || 0;
      const totalPossibleNights = totalRooms * daysInPeriod;
      const occupiedNights = parseInt(hotel.occupied_nights) || 0;
      const occupancyRate = totalPossibleNights > 0
        ? ((occupiedNights / totalPossibleNights) * 100).toFixed(1)
        : 0;

      return {
        id: hotel.id,
        name: hotel.name,
        address: hotel.address,
        status: hotel.status,
        currentPeriodRevenue: currentRevenue,
        previousPeriodRevenue: previousRevenue,
        revenueChange: parseFloat(revenueChange),
        currentPeriodBookings: currentBookings,
        previousPeriodBookings: previousBookings,
        bookingsChange: parseFloat(bookingsChange),
        totalRevenue: parseFloat(hotel.total_revenue) || 0,
        totalBookings: parseInt(hotel.total_bookings) || 0,
        totalRooms: totalRooms,
        occupancyRate: parseFloat(occupancyRate),
      };
    });

    // Format dates cho response - sử dụng local time
    const formatDateForResponse = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return NextResponse.json({
      periodRange: {
        startDate: formatDateForResponse(startDate),
        endDate: formatDateForResponse(endDate),
        previousStartDate: formatDateForResponse(previousStartDate),
        previousEndDate: formatDateForResponse(previousEndDate),
      },
      hotels: hotelsWithStats,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/hotels error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}













