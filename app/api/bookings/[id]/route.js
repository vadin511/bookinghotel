// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";
import db from "../../../lib/db";
import { sendBookingCancellationEmailToAdmin, sendBookingCancellationEmailToUser, sendBookingConfirmationEmail } from "../../../utils/mailer";

// Cập nhật status của booking
export async function PUT(req, { params }) {
  try {
    console.log("PUT /api/bookings/[id] - Starting request");
    
    const user = getUserFromToken(req);
    if (!user) {
      console.error("Unauthorized request");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    console.log("User authenticated:", { id: user.id, role: user.role });

    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let id;
    try {
      if (params && typeof params.then === 'function') {
        // params là Promise
        const resolvedParams = await params;
        id = resolvedParams?.id;
        console.log("Resolved params from Promise:", { id });
      } else {
        // params là object
        id = params?.id;
        console.log("Params is object:", { id, params });
      }
      
      if (!id) {
        console.error("Missing booking ID in params:", params);
        return NextResponse.json(
          { message: "Thiếu ID đặt phòng" },
          { status: 400 }
        );
      }
    } catch (paramError) {
      console.error("Error resolving params:", paramError);
      return NextResponse.json(
        { message: "Lỗi xử lý tham số", error: paramError.message },
        { status: 400 }
      );
    }
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", { status: requestBody?.status, hasReason: !!requestBody?.cancellation_reason, cancellation_type: requestBody?.cancellation_type });
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return NextResponse.json(
        { message: "Dữ liệu không hợp lệ", error: jsonError.message },
        { status: 400 }
      );
    }
    
    const { status, cancellation_reason, cancellation_type } = requestBody || {};
    
    if (!status) {
      console.error("Missing status in request body");
      return NextResponse.json(
        { message: "Thiếu trường status" },
        { status: 400 }
      );
    }
    
    // Xác định cancellation_type nếu không được cung cấp
    // 3 trạng thái: user, admin, system
    let finalCancellationType = cancellation_type;
    if (status === "cancelled" && !finalCancellationType) {
      // Tự động xác định dựa vào role của user
      if (user.role === "admin") {
        finalCancellationType = "admin";
      } else {
        finalCancellationType = "user";
      }
    }
    // Nếu cancellation_type được truyền vào là "system", giữ nguyên
    // (thường được set khi hệ thống tự động hủy do quá hạn)
    
    console.log("Processing cancellation:", { 
      bookingId: id, 
      status, 
      cancellation_reason: cancellation_reason?.substring(0, 50),
      cancellation_type: finalCancellationType
    });

    // Kiểm tra status hợp lệ - cần khớp với ENUM trong database
    // Các giá trị có thể: pending, confirmed, paid, cancelled, completed
    const validStatuses = ["pending", "confirmed", "paid", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      console.error("Invalid status value:", status);
      return NextResponse.json(
        { message: `Status không hợp lệ: ${status}. Các giá trị hợp lệ: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Đảm bảo status là string và trim whitespace
    const cleanStatus = String(status).trim().toLowerCase();
    if (!validStatuses.includes(cleanStatus)) {
      console.error("Invalid cleaned status value:", cleanStatus);
      return NextResponse.json(
        { message: `Status không hợp lệ sau khi xử lý: ${cleanStatus}` },
        { status: 400 }
      );
    }
    
    console.log("Status validated:", { original: status, cleaned: cleanStatus });

    // Kiểm tra booking có tồn tại không
    console.log("Querying booking from database:", { id });
    const [existingBooking] = await db.query(
      "SELECT * FROM bookings WHERE id = ?",
      [id]
    );

    if (existingBooking.length === 0) {
      console.error("Booking not found:", { id });
      return NextResponse.json(
        { message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    const booking = existingBooking[0];
    console.log("Booking found:", { id: booking.id, userId: booking.user_id, currentStatus: booking.status });

    // Kiểm tra quyền: Admin có thể cập nhật bất kỳ booking nào
    // User chỉ có thể hủy (cancelled) booking của chính họ
    if (user.role !== "admin") {
      // So sánh user_id (có thể là string hoặc number)
      const bookingUserId = parseInt(booking.user_id);
      const currentUserId = parseInt(user.id);
      
      console.log("Checking permissions:", { 
        bookingUserId, 
        currentUserId, 
        match: bookingUserId === currentUserId,
        userRole: user.role 
      });
      
      if (isNaN(bookingUserId) || isNaN(currentUserId)) {
        console.error("Invalid user IDs:", { bookingUserId, currentUserId, booking_user_id: booking.user_id, user_id: user.id });
      }
      
      if (bookingUserId !== currentUserId) {
        console.error("Permission denied:", { bookingUserId, currentUserId });
        return NextResponse.json(
          { message: "Bạn không có quyền thực hiện thao tác này" },
          { status: 403 }
        );
      }
      // User chỉ có thể hủy hoặc đánh dấu hoàn thành booking của mình
      if (status !== "cancelled" && status !== "completed") {
        console.error("User trying to update status other than cancelled or completed:", { status });
        return NextResponse.json(
          { message: "Bạn chỉ có thể hủy hoặc đánh dấu hoàn thành đặt phòng của mình" },
          { status: 403 }
        );
      }
      // Kiểm tra khi hủy booking
      if (status === "cancelled") {
        if (booking.status === "cancelled" || booking.status === "completed") {
          console.error("Booking already cancelled or completed:", { currentStatus: booking.status });
          return NextResponse.json(
            { message: "Không thể hủy đặt phòng đã hoàn thành hoặc đã hủy" },
            { status: 400 }
          );
        }
      }
      // Kiểm tra khi đánh dấu hoàn thành
      if (status === "completed") {
        if (booking.status === "cancelled") {
          console.error("Cannot complete a cancelled booking:", { currentStatus: booking.status });
          return NextResponse.json(
            { message: "Không thể đánh dấu hoàn thành đặt phòng đã bị hủy" },
            { status: 400 }
          );
        }
        if (booking.status === "completed") {
          // Đã hoàn thành rồi, không cần cập nhật nhưng không báo lỗi
          console.log("Booking already completed, skipping update");
        }
      }
    }
    
    console.log("Permission check passed, proceeding with update");

    // Cập nhật status và cancellation_reason nếu có
    // Kiểm tra xem bảng có cột cancellation_reason không
    let sql;
    let queryParams;
    
    // Sử dụng cleanStatus thay vì status để đảm bảo đúng format
    const statusToUpdate = cleanStatus;
    
    try {
      // Thử cập nhật với cancellation_reason và cancellation_type
      sql = `
        UPDATE bookings 
        SET status = ?, cancellation_reason = ?, cancellation_type = ?
        WHERE id = ?
      `;
      queryParams = [
        statusToUpdate, 
        cancellation_reason || null, 
        statusToUpdate === "cancelled" ? finalCancellationType : null,
        id
      ];
      console.log("Executing SQL:", { 
        sql, 
        queryParams: [
          statusToUpdate, 
          cancellation_reason ? '***' : null, 
          finalCancellationType,
          id
        ] 
      });
      await db.query(sql, queryParams);
      console.log("Update successful with cancellation_reason and cancellation_type");
    } catch (error) {
      console.error("Database error details:", {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        message: error.message,
        sql: error.sql
      });
      
      // Nếu không có cột cancellation_reason hoặc cancellation_type, thử các cách khác
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 1054 || error.errno === 1054) {
        // Thử chỉ với cancellation_reason (không có cancellation_type)
        try {
          console.warn("Cột cancellation_type có thể không tồn tại, thử chỉ với cancellation_reason");
          sql = `
            UPDATE bookings 
            SET status = ?, cancellation_reason = ?
            WHERE id = ?
          `;
          queryParams = [statusToUpdate, cancellation_reason || null, id];
          await db.query(sql, queryParams);
          console.log("Update successful with cancellation_reason only");
        } catch (error2) {
          // Nếu vẫn lỗi, chỉ cập nhật status
          if (error2.code === 'ER_BAD_FIELD_ERROR' || error2.code === 1054 || error2.errno === 1054) {
            console.warn("Cột cancellation_reason không tồn tại, chỉ cập nhật status");
            sql = `
              UPDATE bookings 
              SET status = ?
              WHERE id = ?
            `;
            queryParams = [statusToUpdate, id];
            console.log("Retrying SQL without cancellation fields:", { sql, queryParams });
            await db.query(sql, queryParams);
            console.log("Update successful without cancellation fields");
          } else {
            throw error2;
          }
        }
      } else if (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406 || error.message?.includes('Data truncated')) {
        // Lỗi do status không khớp với ENUM
        console.error("Status value doesn't match ENUM:", { 
          status: statusToUpdate, 
          error: error.message 
        });
        
        // Thử query để xem ENUM values có sẵn
        try {
          const [enumInfo] = await db.query(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'bookings' 
            AND COLUMN_NAME = 'status'
          `);
          console.error("Available ENUM values:", enumInfo);
        } catch (enumError) {
          console.error("Could not fetch ENUM info:", enumError);
        }
        
        return NextResponse.json(
          { 
            message: `Giá trị status "${statusToUpdate}" không hợp lệ. Vui lòng kiểm tra lại.`,
            error: error.message,
            receivedStatus: status,
            cleanedStatus: statusToUpdate
          },
          { status: 400 }
        );
      } else {
        console.error("Unhandled database error:", error);
        throw error;
      }
    }

    // Gửi email xác nhận đặt phòng khi admin xác nhận
    if (statusToUpdate === "confirmed" && user.role === "admin") {
      try {
        // Lấy thông tin đầy đủ của booking để gửi email
        const [bookingInfo] = await db.query(`
          SELECT 
            b.id AS booking_id,
            b.check_in,
            b.check_out,
            b.total_price,
            u.name AS user_name,
            u.email AS user_email,
            h.name AS hotel_name,
            r.name AS room_name
          FROM bookings b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN hotels h ON b.hotel_id = h.id
          LEFT JOIN booking_details bd ON b.id = bd.booking_id
          LEFT JOIN rooms r ON bd.room_id = r.id
          WHERE b.id = ?
        `, [id]);

        if (bookingInfo.length > 0 && bookingInfo[0].user_email) {
          const booking = bookingInfo[0];
          const checkInDate = new Date(booking.check_in);
          const checkOutDate = new Date(booking.check_out);
          const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
          
          // Gửi email xác nhận đặt phòng thành công cho user
          await sendBookingConfirmationEmail(booking.user_email, {
            booking_id: booking.booking_id,
            user_name: booking.user_name,
            hotel_name: booking.hotel_name,
            room_name: booking.room_name,
            check_in: booking.check_in,
            check_out: booking.check_out,
            total_price: booking.total_price,
            nights: nights
          }).catch(err => {
            console.error('Lỗi gửi email xác nhận đặt phòng cho user:', err);
          });
        }
      } catch (emailError) {
        console.error('Lỗi khi lấy thông tin để gửi email xác nhận đặt phòng:', emailError);
        // Không throw error để không ảnh hưởng đến response thành công
      }
    }

    // Gửi email thông báo khi booking bị hủy
    if (statusToUpdate === "cancelled") {
      try {
        // Xác định ai là người hủy
        const isAdminCancelling = user.role === "admin";

        // Lấy email admin từ database hoặc dùng ADMIN_EMAIL từ env
        let adminEmail = process.env.ADMIN_EMAIL;
        
        if (!adminEmail) {
          // Lấy email admin đầu tiên từ database
          const [adminUsers] = await db.query(
            "SELECT email FROM users WHERE role = 'admin' LIMIT 1"
          );
          if (adminUsers.length > 0) {
            adminEmail = adminUsers[0].email;
          } else {
            // Nếu không có admin, dùng FROM_EMAIL
            adminEmail = process.env.FROM_EMAIL;
          }
        }

        // Lấy thông tin đầy đủ của booking để gửi email
        const [bookingInfo] = await db.query(`
          SELECT 
            b.id AS booking_id,
            b.check_in,
            b.check_out,
            b.total_price,
            b.cancellation_reason,
            u.name AS user_name,
            u.email AS user_email,
            h.name AS hotel_name,
            r.name AS room_name
          FROM bookings b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN hotels h ON b.hotel_id = h.id
          LEFT JOIN booking_details bd ON b.id = bd.booking_id
          LEFT JOIN rooms r ON bd.room_id = r.id
          WHERE b.id = ?
        `, [id]);

        if (bookingInfo.length > 0) {
          const booking = bookingInfo[0];
          const checkInDate = new Date(booking.check_in);
          const checkOutDate = new Date(booking.check_out);
          const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
          const finalCancellationReason = cancellation_reason || booking.cancellation_reason || 'Không có lý do';
          
          // Lấy cancellation_type từ database
          const [bookingWithType] = await db.query(
            "SELECT cancellation_type FROM bookings WHERE id = ?",
            [id]
          );
          const bookingCancellationType = bookingWithType.length > 0 
            ? bookingWithType[0].cancellation_type 
            : finalCancellationType || (isAdminCancelling ? 'admin' : 'user');
          
          // Xử lý 3 trạng thái: user, admin, system
          if (bookingCancellationType === 'system') {
            // Hệ thống tự hủy → gửi email cho cả admin và user
            // Gửi email cho admin
            if (adminEmail) {
              await sendBookingCancellationEmailToAdmin(adminEmail, {
                booking_id: booking.booking_id,
                user_name: booking.user_name,
                user_email: booking.user_email,
                hotel_name: booking.hotel_name,
                room_name: booking.room_name,
                check_in: booking.check_in,
                check_out: booking.check_out,
                total_price: booking.total_price,
                nights: nights,
                cancellation_reason: finalCancellationReason,
                cancellation_type: 'system'
              }).catch(err => {
                console.error('Lỗi gửi email thông báo hủy đặt phòng cho admin:', err);
              });
            }
            
            // Gửi email cho user
            if (booking.user_email) {
              await sendBookingCancellationEmailToUser(booking.user_email, {
                booking_id: booking.booking_id,
                user_name: booking.user_name,
                hotel_name: booking.hotel_name,
                room_name: booking.room_name,
                check_in: booking.check_in,
                check_out: booking.check_out,
                total_price: booking.total_price,
                nights: nights,
                cancellation_reason: finalCancellationReason,
                cancelled_by: 'system'
              }).catch(err => {
                console.error('Lỗi gửi email thông báo hủy đặt phòng cho user:', err);
              });
            }
          } else if (isAdminCancelling || bookingCancellationType === 'admin') {
            // Admin hủy → chỉ gửi email cho user
            if (booking.user_email) {
              await sendBookingCancellationEmailToUser(booking.user_email, {
                booking_id: booking.booking_id,
                user_name: booking.user_name,
                hotel_name: booking.hotel_name,
                room_name: booking.room_name,
                check_in: booking.check_in,
                check_out: booking.check_out,
                total_price: booking.total_price,
                nights: nights,
                cancellation_reason: finalCancellationReason,
                cancelled_by: 'admin'
              }).catch(err => {
                console.error('Lỗi gửi email thông báo hủy đặt phòng cho user:', err);
              });
            }
          } else if (bookingCancellationType === 'user') {
            // User hủy → gửi email cho cả admin và user
            // Gửi email cho admin
            if (adminEmail) {
              await sendBookingCancellationEmailToAdmin(adminEmail, {
                booking_id: booking.booking_id,
                user_name: booking.user_name,
                user_email: booking.user_email,
                hotel_name: booking.hotel_name,
                room_name: booking.room_name,
                check_in: booking.check_in,
                check_out: booking.check_out,
                total_price: booking.total_price,
                nights: nights,
                cancellation_reason: finalCancellationReason,
                cancellation_type: 'user'
              }).catch(err => {
                console.error('Lỗi gửi email thông báo hủy đặt phòng cho admin:', err);
              });
            }
            
            // Gửi email cho user
            if (booking.user_email) {
              await sendBookingCancellationEmailToUser(booking.user_email, {
                booking_id: booking.booking_id,
                user_name: booking.user_name,
                hotel_name: booking.hotel_name,
                room_name: booking.room_name,
                check_in: booking.check_in,
                check_out: booking.check_out,
                total_price: booking.total_price,
                nights: nights,
                cancellation_reason: finalCancellationReason,
                cancelled_by: 'user'
              }).catch(err => {
                console.error('Lỗi gửi email thông báo hủy đặt phòng cho user:', err);
              });
            }
          }
        }
      } catch (emailError) {
        console.error('Lỗi khi lấy thông tin để gửi email thông báo hủy:', emailError);
        // Không throw error để không ảnh hưởng đến response thành công
      }
    }

    // Lưu ý: Không cần cập nhật status của phòng vì:
    // 1. Availability được quản lý qua booking_details và dates
    // 2. Status 'unavailable' không tồn tại trong schema rooms
    // 3. Hệ thống sẽ tự động filter phòng đã được đặt khi search

    return NextResponse.json({
      message: "Cập nhật status thành công",
      booking_id: id,
      new_status: statusToUpdate,
      cancellation_reason: cancellation_reason || null,
      cancellation_type: statusToUpdate === "cancelled" ? finalCancellationType : null,
    });
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
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

// Lấy thông tin booking theo ID
export async function GET(req, { params }) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Xử lý params - có thể là object hoặc Promise trong Next.js 13+
    let id;
    try {
      if (params && typeof params.then === 'function') {
        // params là Promise
        const resolvedParams = await params;
        id = resolvedParams?.id;
      } else {
        // params là object
        id = params?.id;
      }
      
      if (!id) {
        console.error("Missing booking ID in params:", params);
        return NextResponse.json(
          { message: "Thiếu ID đặt phòng" },
          { status: 400 }
        );
      }
    } catch (paramError) {
      console.error("Error resolving params:", paramError);
      return NextResponse.json(
        { message: "Lỗi xử lý tham số", error: paramError.message },
        { status: 400 }
      );
    }

    const [bookings] = await db.query(
      `
      SELECT b.*,
             h.name AS hotel_name, h.address AS hotel_address,
             u.name AS user_name, u.email AS user_email
      FROM bookings b
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `,
      [id]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy booking" },
        { status: 404 }
      );
    }

    // Chỉ admin hoặc chủ sở hữu booking mới xem được
    const bookingUserId = parseInt(bookings[0].user_id);
    const currentUserId = parseInt(user.id);
    
    if (user.role !== "admin" && bookingUserId !== currentUserId) {
      return NextResponse.json(
        { message: "Không có quyền xem booking này" },
        { status: 403 }
      );
    }

    // Lấy chi tiết phòng
    const [details] = await db.query(`
      SELECT bd.*, r.name AS room_name, r.price_per_night
      FROM booking_details bd
      LEFT JOIN rooms r ON bd.room_id = r.id
      WHERE bd.booking_id = ?
    `, [id]);

    return NextResponse.json({
      ...bookings[0],
      rooms: details || [],
    });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
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

