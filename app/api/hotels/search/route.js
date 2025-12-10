// app/api/hotels/search/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || "";
    const check_in = searchParams.get("check_in") || "";
    const check_out = searchParams.get("check_out") || "";
    const adults = parseInt(searchParams.get("adults")) || 1;
    const min_price = parseFloat(searchParams.get("min_price")) || 0;
    const max_price = parseFloat(searchParams.get("max_price")) || 100000000;
    const min_rating = parseFloat(searchParams.get("min_rating")) || 0;
    const min_reviews = parseInt(searchParams.get("min_reviews")) || 0;
    const sort_by = searchParams.get("sort_by") || "popularity"; // popularity, price_asc, price_desc, rating
    const room_type = searchParams.get("room_type") || "";
    const star_rating = searchParams.get("star_rating") || ""; // Comma-separated list of star ratings (e.g., "5,4")

    // Xây dựng query SQL - Group by hotel và lấy thông tin rating, min price
    let sql = `
      SELECT DISTINCT 
        h.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        MIN(rm.price_per_night) as min_price_per_night,
        MAX(rm.price_per_night) as max_price_per_night,
        COUNT(DISTINCT rm.id) as available_rooms_count
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      INNER JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.status = 'active' AND rm.status = 'available'
    `;

    const params = [];

    // Filter theo location
    if (location) {
      sql += ` AND h.location LIKE ?`;
      const locationPattern = `%${location}%`;
      params.push(locationPattern);
    }

    // Filter theo số người (max_people)
    if (adults > 0) {
      sql += ` AND rm.max_people >= ?`;
      params.push(adults);
    }

    // Filter theo giá
    if (min_price > 0 || max_price < 100000000) {
      sql += ` AND rm.price_per_night >= ? AND rm.price_per_night <= ?`;
      params.push(min_price, max_price);
    }

    // Filter theo room type
    if (room_type) {
      sql += ` AND rm.room_type_id = ?`;
      params.push(parseInt(room_type));
    }

    // Filter theo star rating sẽ được xử lý trong HAVING clause (sau GROUP BY)
    // vì average_rating được tính từ AVG(r.rating)

    // Filter theo phòng còn trống trong khoảng thời gian
    if (check_in && check_out) {
      sql += ` AND rm.id NOT IN (
        SELECT DISTINCT bd.room_id
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.id
        WHERE b.status IN ('pending', 'confirmed', 'paid')
          AND (
            (b.check_in <= ? AND b.check_out > ?)
            OR (b.check_in < ? AND b.check_out >= ?)
            OR (b.check_in >= ? AND b.check_out <= ?)
          )
      )`;
      params.push(
        check_in,
        check_in,
        check_out,
        check_out,
        check_in,
        check_out
      );
    }

    // Group by
    sql += ` GROUP BY h.id`;

    // HAVING clauses - must be after GROUP BY
    const havingConditions = [];
    const havingParams = [];

    // Filter theo rating
    if (min_rating > 0) {
      havingConditions.push(`average_rating >= ?`);
      havingParams.push(min_rating);
    }

    // Filter theo số lượng reviews
    if (min_reviews > 0) {
      havingConditions.push(`total_reviews >= ?`);
      havingParams.push(min_reviews);
    }

    // Filter theo star rating dựa trên average_rating
    // Quy tắc: 5 sao >= 4.5, 4 sao >= 3.5, 3 sao >= 2.5, 2 sao >= 1.5, 1 sao >= 0.5
    if (star_rating) {
      const starRatings = star_rating.split(",").map(s => parseInt(s.trim())).filter(s => s > 0 && s <= 5);
      if (starRatings.length > 0) {
        const starConditions = starRatings.map(star => {
          // 5 sao >= 4.5, 4 sao >= 3.5 và < 4.5, 3 sao >= 2.5 và < 3.5, etc.
          if (star === 5) {
            return `average_rating >= ?`;
          } else {
            return `(average_rating >= ? AND average_rating < ?)`;
          }
        });
        
        havingConditions.push(`(${starConditions.join(' OR ')})`);
        
        // Thêm params cho từng điều kiện
        starRatings.forEach(star => {
          const minRating = star - 0.5;
          havingParams.push(minRating);
          if (star !== 5) {
            havingParams.push(star + 0.5);
          }
        });
      }
    }

    if (havingConditions.length > 0) {
      sql += ` HAVING ${havingConditions.join(' AND ')}`;
      params.push(...havingParams);
    }

    // Sorting
    switch (sort_by) {
      case "price_asc":
        sql += ` ORDER BY min_price_per_night ASC`;
        break;
      case "price_desc":
        sql += ` ORDER BY min_price_per_night DESC`;
        break;
      case "rating":
        sql += ` ORDER BY average_rating DESC, total_reviews DESC`;
        break;
      case "popularity":
      default:
        sql += ` ORDER BY total_reviews DESC, average_rating DESC`;
        break;
    }

    const [hotels] = await db.query(sql, params);

    // Tính ngày hiện tại và ngày kết thúc (90 ngày sau)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 90);
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Lấy photos và xử lý dữ liệu
    const hotelsWithPhotos = await Promise.all(
      hotels.map(async (hotel) => {
        // Lấy hotel photos
        const [hotelPhotos] = await db.query(
          "SELECT photo_url FROM hotel_photos WHERE hotel_id = ? ORDER BY id",
          [hotel.id]
        );

        // Lấy rooms với photos
        const [rooms] = await db.query(
          `SELECT r.*, 
             GROUP_CONCAT(rp.photo_url ORDER BY rp.id) as photos
           FROM rooms r
           LEFT JOIN room_photos rp ON r.id = rp.room_id
           WHERE r.hotel_id = ? AND r.status = 'available'
           GROUP BY r.id`,
          [hotel.id]
        );

        const roomsWithPhotos = rooms.map(room => ({
          ...room,
          photos: room.photos ? room.photos.split(',') : []
        }));

        // Đếm tổng số phòng available của khách sạn (chỉ query một lần)
        const [totalRoomsResult] = await db.query(
          "SELECT COUNT(*) as total FROM rooms WHERE hotel_id = ? AND status = 'available'",
          [hotel.id]
        );
        const totalRooms = totalRoomsResult[0]?.total || 0;

        // Tính số ngày trống trong 90 ngày tới
        // Logic: Tính số ngày mà khách sạn có ít nhất 1 phòng trống
        let availableDays = 0;
        try {
          if (totalRooms > 0) {
            // Lấy tất cả các booking trong 90 ngày tới
            const [bookings] = await db.query(`
              SELECT b.check_in, b.check_out, COUNT(DISTINCT bd.room_id) as booked_rooms
              FROM bookings b
              JOIN booking_details bd ON b.id = bd.booking_id
              JOIN rooms r ON bd.room_id = r.id
              WHERE r.hotel_id = ?
                AND b.status IN ('pending', 'confirmed', 'paid')
                AND b.check_in < ?
                AND b.check_out > ?
              GROUP BY b.id, b.check_in, b.check_out
            `, [hotel.id, futureDateStr, todayStr]);

            // Tính số ngày trống dựa trên tỷ lệ booking
            // Nếu không có booking nào, tất cả 90 ngày đều trống
            if (bookings.length === 0) {
              availableDays = 90;
            } else {
              // Tính tỷ lệ booking: nếu booking chiếm ít hơn 100% phòng, thì có ngày trống
              // Ước tính: số ngày trống = 90 * (1 - tỷ lệ booking trung bình)
              let totalBookedDays = 0;
              bookings.forEach(booking => {
                const checkInDate = new Date(booking.check_in);
                const checkOutDate = new Date(booking.check_out);
                const bookingDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                // Chỉ tính các ngày trong khoảng 90 ngày tới
                const startDate = new Date(Math.max(checkInDate.getTime(), new Date(todayStr).getTime()));
                const endDate = new Date(Math.min(checkOutDate.getTime(), new Date(futureDateStr).getTime()));
                if (endDate > startDate) {
                  const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                  // Tính tỷ lệ phòng đã đặt
                  const bookingRatio = Math.min(1, booking.booked_rooms / totalRooms);
                  totalBookedDays += daysInRange * bookingRatio;
                }
              });
              
              // Số ngày trống = 90 - số ngày đã đặt (tính theo tỷ lệ)
              availableDays = Math.max(0, Math.min(90, Math.round(90 - totalBookedDays)));
            }
          } else {
            availableDays = 0;
          }
        } catch (daysError) {
          console.error(`Error calculating available days for hotel ${hotel.id}:`, daysError);
          // Nếu có lỗi, đặt giá trị mặc định dựa trên available_rooms_count
          availableDays = hotel.available_rooms_count > 0 ? 90 : 0;
        }

        // Tính số phòng trống trong khoảng thời gian tìm kiếm (check_in/check_out)
        let availableRoomsInPeriod = 0;
        if (check_in && check_out) {
          try {
            if (totalRooms > 0) {
              // Đếm số phòng đã được đặt trong khoảng thời gian check_in đến check_out
              // Logic overlap: Hai khoảng thời gian overlap nếu: (new_check_in < old_check_out) AND (new_check_out > old_check_in)
              const [bookedRoomsResult] = await db.query(`
                SELECT COUNT(DISTINCT bd.room_id) as booked_count
                FROM booking_details bd
                JOIN bookings b ON bd.booking_id = b.id
                JOIN rooms r ON bd.room_id = r.id
                WHERE r.hotel_id = ?
                  AND b.status IN ('pending', 'confirmed', 'paid')
                  AND ? < b.check_out
                  AND ? > b.check_in
              `, [hotel.id, check_in, check_out]);

              const bookedRooms = bookedRoomsResult[0]?.booked_count || 0;
              availableRoomsInPeriod = Math.max(0, totalRooms - bookedRooms);
            }
          } catch (roomsError) {
            console.error(`Error calculating available rooms in period for hotel ${hotel.id}:`, roomsError);
            // Nếu có lỗi, sử dụng available_rooms_count làm giá trị mặc định
            availableRoomsInPeriod = hotel.available_rooms_count || 0;
          }
        } else {
          // Nếu không có check_in/check_out, sử dụng tổng số phòng available
          availableRoomsInPeriod = totalRooms;
        }

        return {
          ...hotel,
          photos: hotelPhotos.map(p => p.photo_url),
          average_rating: hotel.average_rating ? parseFloat(hotel.average_rating).toFixed(1) : '0.0',
          total_reviews: parseInt(hotel.total_reviews) || 0,
          min_price_per_night: parseFloat(hotel.min_price_per_night) || 0,
          max_price_per_night: parseFloat(hotel.max_price_per_night) || 0,
          available_rooms_count: parseInt(hotel.available_rooms_count) || 0,
          available_days: availableDays, // Số ngày trống trong 90 ngày tới
          available_rooms_in_period: availableRoomsInPeriod, // Số phòng trống trong khoảng thời gian tìm kiếm
          rooms: roomsWithPhotos
        };
      })
    );

    return NextResponse.json(hotelsWithPhotos);
  } catch (error) {
    console.error("GET /api/hotels/search error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi tìm kiếm khách sạn" },
      { status: 500 }
    );
  }
}

