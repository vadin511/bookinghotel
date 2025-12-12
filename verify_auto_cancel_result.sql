-- Kiểm tra kết quả tự hủy của booking 63
SELECT 
    id, 
    status, 
    cancellation_reason, 
    cancellation_type,
    check_out,
    updated_at,
    CASE 
        WHEN status = 'cancelled' 
         AND cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận'
         AND cancellation_type = 'system'
        THEN '✅ THÀNH CÔNG - Đúng kết quả mong đợi!'
        WHEN status = 'pending'
        THEN '⏳ CHƯA TỰ HỦY - Kiểm tra console logs và user_id'
        ELSE '❌ CHƯA ĐÚNG - Kiểm tra lại'
    END as test_result
FROM bookinghotel.bookings 
WHERE id = 63;

