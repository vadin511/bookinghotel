// app/api/bookings/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../lib/auth";
import db from "../../lib/db";

// Tạo booking
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { room_id, check_in, check_out, total_price, payment_method } =
      await req.json();
    
    // KHÔNG đụng đến status khi tạo booking mới
    // Status chỉ được set = "pending" sau khi thanh toán thành công

    // Kiểm tra dữ liệu đầu vào
    if (!room_id || !check_in || !check_out || !total_price) {
      return NextResponse.json(
        { message: "Thiếu trường bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra ngày tháng hợp lệ
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        { message: "Ngày check-in không được là quá khứ" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: "Ngày check-out phải sau ngày check-in" },
        { status: 400 }
      );
    }

    // Lấy thông tin phòng để lấy hotel_id và price_per_night
    const [rooms] = await db.query("SELECT hotel_id, price_per_night FROM rooms WHERE id = ?", [room_id]);
    if (rooms.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy phòng" },
        { status: 404 }
      );
    }

    const room = rooms[0];
    const hotel_id = room.hotel_id;
    const price_per_night = room.price_per_night;

    // Kiểm tra phòng có còn trống không (kiểm tra qua booking_details)
    // Logic: Hai khoảng thời gian overlap nếu: (new_check_in < old_check_out) AND (new_check_out > old_check_in)
    // Chỉ kiểm tra booking đã có status (pending, confirmed, paid) hoặc NULL (đang chờ thanh toán)
    const checkAvailabilitySql = `
      SELECT COUNT(*) as count
      FROM booking_details bd
      JOIN bookings b ON bd.booking_id = b.id
      WHERE bd.room_id = ?
        AND (b.status IN ('pending', 'confirmed', 'paid') OR b.status IS NULL)
        AND ? < b.check_out
        AND ? > b.check_in
    `;

    const [availabilityResult] = await db.query(checkAvailabilitySql, [
      room_id,
      check_in,
      check_out,
    ]);

    if (availabilityResult[0].count > 0) {
      // Lấy thông tin booking đang conflict để hiển thị chi tiết hơn
      const [conflictBookings] = await db.query(`
        SELECT b.id, b.check_in, b.check_out, b.status
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.id
        WHERE bd.room_id = ?
          AND (b.status IN ('pending', 'confirmed', 'paid') OR b.status IS NULL)
          AND ? < b.check_out
          AND ? > b.check_in
        LIMIT 1
      `, [room_id, check_in, check_out]);

      // Format ngày tháng theo định dạng tiếng Việt dễ đọc
      const formatDateVietnamese = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      let errorMessage = 'Rất tiếc, phòng này đã được đặt bởi khách hàng khác trong khoảng thời gian bạn chọn.';
      
      if (conflictBookings.length > 0) {
        const conflictCheckIn = formatDateVietnamese(conflictBookings[0].check_in);
        const conflictCheckOut = formatDateVietnamese(conflictBookings[0].check_out);
        errorMessage = `Rất tiếc, phòng này đã được đặt bởi khách hàng khác từ ngày ${conflictCheckIn} đến ngày ${conflictCheckOut}. Vui lòng chọn khoảng thời gian khác.`;
      }
      
      return NextResponse.json(
        { 
          message: errorMessage,
          conflict: conflictBookings.length > 0 ? conflictBookings[0] : null
        },
        { status: 409 }
      );
    }

    // Tạo booking (bước 1) - KHÔNG set status, để database tự xử lý
    const bookingSql = `
      INSERT INTO bookings (user_id, hotel_id, check_in, check_out, total_price, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [bookingResult] = await db.query(bookingSql, [
      user.id,
      hotel_id,
      check_in,
      check_out,
      total_price,
      payment_method || "cod",
    ]);

    const bookingId = bookingResult.insertId;

    // Tạo booking_details (bước 2)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const subtotal = price_per_night * nights;

    const bookingDetailsSql = `
      INSERT INTO booking_details (booking_id, room_id, quantity, price_per_night, subtotal)
      VALUES (?, ?, 1, ?, ?)
    `;

    await db.query(bookingDetailsSql, [
      bookingId,
      room_id,
      price_per_night,
      subtotal,
    ]);

    // Lưu ý: Không cần cập nhật status của phòng vì:
    // 1. Availability đã được kiểm tra qua booking_details và dates
    // 2. Status 'unavailable' không tồn tại trong schema rooms
    // 3. Hệ thống sẽ tự động filter phòng đã được đặt khi search qua booking_details

    return NextResponse.json({ 
      message: "Booking đã được tạo, vui lòng thanh toán để hoàn tất đặt phòng", 
      booking_id: bookingId,
      result: bookingResult 
    });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: error.message || "Lỗi server khi đặt phòng",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

// Lấy tất cả bookings (admin) hoặc bookings của user hiện tại
export async function GET(req) {
  try {
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để xem đặt phòng" },
        { status: 401 }
      );
    }

    // Nếu là admin, lấy tất cả bookings
    if (user.role === "admin") {
      let bookings = [];
      try {
        const [bookingsResult] = await db.query(`
          SELECT b.*,
                 h.name AS hotel_name, h.address AS hotel_address,
                 u.email AS user_email, 
                 u.name AS user_name
          FROM bookings b
          LEFT JOIN hotels h ON b.hotel_id = h.id
          LEFT JOIN users u ON b.user_id = u.id
          ORDER BY b.created_at DESC
        `);
        bookings = bookingsResult || [];
      } catch (err) {
        console.error("Error fetching bookings:", err);
        return NextResponse.json(
          { message: "Lỗi khi lấy danh sách booking: " + err.message },
          { status: 500 }
        );
      }
      
      // Lấy chi tiết phòng cho mỗi booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          try {
            // Lấy booking_details từ schema mới
            const [detailsResult] = await db.query(`
              SELECT bd.*, r.name AS room_name, r.price_per_night
              FROM booking_details bd
              LEFT JOIN rooms r ON bd.room_id = r.id
              WHERE bd.booking_id = ?
            `, [booking.id]);
            
            return {
              ...booking,
              rooms: detailsResult || [],
            };
          } catch (err) {
            console.error(`Error processing booking ${booking.id}:`, err.message, err.stack);
            return {
              ...booking,
              rooms: [],
            };
          }
        })
      );
      
      return NextResponse.json(bookingsWithDetails);
    }

    // Nếu là user thường, chỉ lấy bookings của user đó
    let bookings = [];
    try {
      const [bookingsResult] = await db.query(`
        SELECT b.*,
               h.name AS hotel_name, h.address AS hotel_address
        FROM bookings b
        LEFT JOIN hotels h ON b.hotel_id = h.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `, [user.id]);
      bookings = bookingsResult || [];
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      return NextResponse.json(
        { message: "Lỗi khi lấy danh sách booking: " + err.message },
        { status: 500 }
      );
    }

    // Lấy chi tiết phòng cho mỗi booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Lấy booking_details từ schema mới
          const [detailsResult] = await db.query(`
            SELECT bd.*, r.name AS room_name, r.price_per_night
            FROM booking_details bd
            LEFT JOIN rooms r ON bd.room_id = r.id
            WHERE bd.booking_id = ?
          `, [booking.id]);
          
          return {
            ...booking,
            rooms: detailsResult || [],
          };
        } catch (err) {
          console.error(`Error processing booking ${booking.id}:`, err);
          return {
            ...booking,
            rooms: [],
          };
        }
      })
    );

    return NextResponse.json(bookingsWithDetails);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        message: "Lỗi server", 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}
