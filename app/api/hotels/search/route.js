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
    const sort_by = searchParams.get("sort_by") || "popularity";
    const room_type = searchParams.get("room_type") || "";
    const star_rating = searchParams.get("star_rating") || "";

    // 1. Base Query to identify potential hotels
    // Nếu có check_in/check_out: filter chặt (chỉ lấy khách sạn có phòng available và trống)
    // Nếu không có: filter lỏng (hiển thị tất cả khách sạn, chỉ filter theo location)
    const hasDateFilter = check_in && check_out;
    
    let sql = `
      SELECT DISTINCT 
        h.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        MIN(rm.price_per_night) as min_price_per_night,
        MAX(rm.price_per_night) as max_price_per_night,
        COUNT(DISTINCT CASE WHEN rm.status = 'available' THEN rm.id END) as available_rooms_count
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
    `;

    // Nếu có check_in/check_out hoặc filter theo price/room_type: dùng INNER JOIN để đảm bảo có phòng phù hợp
    // Nếu không: dùng LEFT JOIN để hiển thị tất cả khách sạn (kể cả không có phòng available)
    if (hasDateFilter || min_price > 0 || max_price < 100000000 || room_type) {
      sql += ` INNER JOIN rooms rm ON h.id = rm.hotel_id`;
      sql += ` WHERE h.status = 'active' AND rm.status = 'available'`;
    } else {
      sql += ` LEFT JOIN rooms rm ON h.id = rm.hotel_id AND rm.status = 'available'`;
      sql += ` WHERE h.status = 'active'`;
    }

    const params = [];

    // --- Filters ---
    if (location) {
      sql += ` AND h.location LIKE ?`;
      params.push(`%${location}%`);
    }

    // Filter theo adults: nếu có date filter hoặc price filter thì bắt buộc phải có phòng phù hợp
    // Nếu không, vẫn hiển thị khách sạn (có thể không có phòng phù hợp)
    if (adults > 0) {
      if (hasDateFilter || min_price > 0 || max_price < 100000000 || room_type) {
        // Có filter khác: bắt buộc phải có phòng phù hợp
        sql += ` AND rm.max_people >= ?`;
        params.push(adults);
      } else {
        // Không có filter khác: hiển thị tất cả khách sạn, nhưng ưu tiên những khách sạn có phòng phù hợp
        // (không filter, để hiển thị nhiều khách sạn hơn)
      }
    }

    if (min_price > 0 || max_price < 100000000) {
      sql += ` AND rm.price_per_night >= ? AND rm.price_per_night <= ?`;
      params.push(min_price, max_price);
    }

    if (room_type) {
      sql += ` AND rm.room_type_id = ?`;
      params.push(parseInt(room_type));
    }

    // Availability Filter (Pre-check at Query Level) - chỉ áp dụng khi có check_in/check_out
    if (hasDateFilter) {
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
      params.push(check_in, check_in, check_out, check_out, check_in, check_out);
    }

    // --- Group By ---
    sql += ` GROUP BY h.id`;

    // --- Having Clauses ---
    const havingConditions = [];
    const havingParams = [];

    // Rating Filter
    if (min_rating > 0) {
      havingConditions.push(`average_rating >= ?`);
      havingParams.push(min_rating);
    }

    // Reviews Filter
    if (min_reviews > 0) {
      havingConditions.push(`total_reviews >= ?`);
      havingParams.push(min_reviews);
    }

    // Star Rating Logic
    if (star_rating) {
      const starRatings = star_rating.split(",").map(s => parseInt(s.trim())).filter(s => s > 0 && s <= 5);
      if (starRatings.length > 0) {
        const starConditions = starRatings.map(star => {
          if (star === 5) return `average_rating >= ?`;
          return `(average_rating >= ? AND average_rating < ?)`;
        });
        
        havingConditions.push(`(${starConditions.join(' OR ')})`);
        
        starRatings.forEach(star => {
          havingParams.push(star - 0.5);
          if (star !== 5) havingParams.push(star + 0.5);
        });
      }
    }

    if (havingConditions.length > 0) {
      sql += ` HAVING ${havingConditions.join(' AND ')}`;
      params.push(...havingParams);
    }

    // --- Sorting ---
    switch (sort_by) {
      case "price_asc": sql += ` ORDER BY min_price_per_night ASC`; break;
      case "price_desc": sql += ` ORDER BY min_price_per_night DESC`; break;
      case "rating": sql += ` ORDER BY average_rating DESC, total_reviews DESC`; break;
      case "popularity":
      default: sql += ` ORDER BY total_reviews DESC, average_rating DESC`; break;
    }

    const [hotels] = await db.query(sql, params);

    // If no hotels found, return early
    if (hotels.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Batch Fetching Related Data
    const hotelIds = hotels.map(h => h.id);
    const hotelIdsPlaceholder = hotelIds.map(() => '?').join(',');

    // Helper to calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 90);
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // execute parallel queries
    const [
      allHotelPhotos,
      allRooms,
      allRoomPhotos,
      allFutureBookings,
    ] = await Promise.all([
      // Fetch all hotel photos
      db.query(
        `SELECT hotel_id, photo_url FROM hotel_photos WHERE hotel_id IN (${hotelIdsPlaceholder}) ORDER BY id`,
        hotelIds
      ).then(([rows]) => rows),

      // Fetch all rooms
      db.query(
        `SELECT * FROM rooms WHERE hotel_id IN (${hotelIdsPlaceholder}) AND status = 'available'`,
        hotelIds
      ).then(([rows]) => rows),

      // Fetch all room photos - optimized to join with rooms first to filter by hotel
      db.query(
        `SELECT rp.room_id, rp.photo_url 
         FROM room_photos rp 
         JOIN rooms r ON rp.room_id = r.id 
         WHERE r.hotel_id IN (${hotelIdsPlaceholder}) 
         ORDER BY rp.id`,
        hotelIds
      ).then(([rows]) => rows),

      // Fetch all relevant bookings for availability calc (next 90 days)
      db.query(
        `SELECT b.check_in, b.check_out, bd.room_id, r.hotel_id
         FROM bookings b
         JOIN booking_details bd ON b.id = bd.booking_id
         JOIN rooms r ON bd.room_id = r.id
         WHERE r.hotel_id IN (${hotelIdsPlaceholder})
           AND b.status IN ('pending', 'confirmed', 'paid')
           AND b.check_in < ?
           AND b.check_out > ?`,
        [...hotelIds, futureDateStr, todayStr]
      ).then(([rows]) => rows),
    ]);

    // 3. Data Processing & Mapping
    
    // Group photos by hotel
    const hotelPhotosMap = new Map();
    allHotelPhotos.forEach(p => {
      if (!hotelPhotosMap.has(p.hotel_id)) hotelPhotosMap.set(p.hotel_id, []);
      hotelPhotosMap.get(p.hotel_id).push(p.photo_url);
    });

    // Group room photos by room
    const roomPhotosMap = new Map();
    allRoomPhotos.forEach(p => {
      if (!roomPhotosMap.has(p.room_id)) roomPhotosMap.set(p.room_id, []);
      roomPhotosMap.get(p.room_id).push(p.photo_url);
    });

    // Group rooms by hotel and attach photos
    const roomsMap = new Map();
    allRooms.forEach(room => {
      if (!roomsMap.has(room.hotel_id)) roomsMap.set(room.hotel_id, []);
      const photos = roomPhotosMap.get(room.id) || [];
      roomsMap.get(room.hotel_id).push({ ...room, photos });
    });

    // Group bookings by hotel
    const bookingsMap = new Map();
    allFutureBookings.forEach(b => {
      if (!bookingsMap.has(b.hotel_id)) bookingsMap.set(b.hotel_id, []);
      bookingsMap.get(b.hotel_id).push(b);
    });

    // 4. Final Assembly
    const finalResults = hotels.map(hotel => {
      const hotelPhotoUrls = hotelPhotosMap.get(hotel.id) || [];
      const hotelRooms = roomsMap.get(hotel.id) || [];
      const hotelBookings = bookingsMap.get(hotel.id) || [];
      const totalRooms = hotelRooms.length;

      // Calculate Available Days (90 days logic)
      let availableDays = 0;
      if (totalRooms > 0) {
        if (hotelBookings.length === 0) {
          availableDays = 90;
        } else {
          // Simplification of the original logic using pre-fetched data
          // We iterate through days and check capacity
          let blockedDays = 0;
          
          // Determine the range we care about
          const startCalc = new Date(todayStr);
          const endCalc = new Date(futureDateStr);
          
          // Create a map of day -> booked_count
          const dayUsage = new Map(); // key: timestamp, value: count
          
          hotelBookings.forEach(booking => {
             const bCheckIn = new Date(Math.max(new Date(booking.check_in).getTime(), startCalc.getTime()));
             const bCheckOut = new Date(Math.min(new Date(booking.check_out).getTime(), endCalc.getTime()));
             
             for (let d = new Date(bCheckIn); d < bCheckOut; d.setDate(d.getDate() + 1)) {
                 const time = d.getTime();
                 dayUsage.set(time, (dayUsage.get(time) || 0) + 1);
             }
          });

          // Count days where usage >= totalRooms (fully booked)
          // However, original logic was simpler: generic "occupancy rate". 
          // Replicating original logic's intent more accurately:
          // "availableDays = 90 - sum(days * (booked_rooms / total_rooms))"
          
           let totalBookedDaysWeighted = 0;
           // Group bookings by unique booking ID to match original logic is tricky without booking ID in `allFutureBookings` flat list.
           // Better approach: Calculate exact availability per day is more accurate than original logic anyway.
           // However, to stick to the "weighted average" style without re-fetching everything:
           
           // We will use the exact daily availability calculation which is O(90 * bookings) - efficient enough in memory
           let totalFreeDays = 0;
           for (let d = new Date(startCalc); d < endCalc; d.setDate(d.getDate() + 1)) {
              if ((dayUsage.get(d.getTime()) || 0) < totalRooms) {
                  totalFreeDays++;
              }
           }
           availableDays = totalFreeDays;
        }
      }

      // Calculate Available Rooms In Search Period
      let availableRoomsInPeriod = 0;
      if (check_in && check_out) {
        const cIn = new Date(check_in).getTime();
        const cOut = new Date(check_out).getTime();
        
        // Count uniq rooms booked in this overlap
        const bookedRoomIds = new Set();
        hotelBookings.forEach(b => {
          const bIn = new Date(b.check_in).getTime();
          const bOut = new Date(b.check_out).getTime();
          // Overlap condition
          if (cIn < bOut && cOut > bIn) {
            bookedRoomIds.add(b.room_id);
          }
        });
        
        availableRoomsInPeriod = Math.max(0, totalRooms - bookedRoomIds.size);
      } else {
        availableRoomsInPeriod = totalRooms;
      }

      return {
        ...hotel,
        photos: hotelPhotoUrls,
        average_rating: hotel.average_rating ? parseFloat(hotel.average_rating).toFixed(1) : '0.0',
        total_reviews: parseInt(hotel.total_reviews) || 0,
        min_price_per_night: parseFloat(hotel.min_price_per_night) || 0,
        max_price_per_night: parseFloat(hotel.max_price_per_night) || 0,
        available_rooms_count: parseInt(hotel.available_rooms_count) || 0,
        available_days: availableDays,
        available_rooms_in_period: availableRoomsInPeriod,
        rooms: hotelRooms
      };
    });

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("GET /api/hotels/search error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi tìm kiếm khách sạn" },
      { status: 500 }
    );
  }
}

