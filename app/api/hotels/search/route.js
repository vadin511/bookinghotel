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

        return {
          ...hotel,
          photos: hotelPhotos.map(p => p.photo_url),
          average_rating: hotel.average_rating ? parseFloat(hotel.average_rating).toFixed(1) : '0.0',
          total_reviews: parseInt(hotel.total_reviews) || 0,
          min_price_per_night: parseFloat(hotel.min_price_per_night) || 0,
          max_price_per_night: parseFloat(hotel.max_price_per_night) || 0,
          available_rooms_count: parseInt(hotel.available_rooms_count) || 0,
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

