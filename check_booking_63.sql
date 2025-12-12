-- Kiểm tra booking 63 có đủ điều kiện để tự hủy không
SELECT 
    id, 
    user_id, 
    status, 
    check_in, 
    check_out, 
    created_at,
    cancellation_reason,
    cancellation_type,
    DATEDIFF(CURDATE(), DATE(check_out)) as days_after_checkout,
    CASE 
        WHEN DATE(check_out) < CURDATE() THEN '✅ Đã qua ngày checkout'
        WHEN DATE(check_out) = CURDATE() AND TIME(NOW()) >= '12:00:00' THEN '✅ Đã qua 12:00 PM hôm nay'
        ELSE '❌ Chưa quá checkout - Cần chỉnh check_out về quá khứ'
    END as checkout_status
FROM bookinghotel.bookings 
WHERE id = 63;

