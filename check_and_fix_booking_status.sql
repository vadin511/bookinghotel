-- Script để kiểm tra và sửa ENUM cho cột status trong bảng bookings
-- Chạy script này để đảm bảo ENUM có đầy đủ các giá trị: pending, confirmed, paid, cancelled, completed

-- 1. Kiểm tra ENUM values hiện tại
SELECT 
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- 2. Kiểm tra các booking đang có status gì
SELECT 
    status,
    COUNT(*) as count
FROM bookinghotel.bookings
GROUP BY status;

-- 3. Cập nhật ENUM để thêm 'cancelled' và 'completed' (nếu chưa có)
-- Lưu ý: MySQL không hỗ trợ ALTER ENUM trực tiếp, cần MODIFY COLUMN
-- Thay thế toàn bộ ENUM với các giá trị mới
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') 
DEFAULT 'pending';

-- 4. Kiểm tra lại sau khi cập nhật
SELECT 
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- 5. Kiểm tra booking test (thay id = 62 bằng id bạn muốn kiểm tra)
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
        WHEN DATE(check_out) < CURDATE() THEN 'Đã qua ngày checkout'
        WHEN DATE(check_out) = CURDATE() AND TIME(NOW()) >= '12:00:00' THEN 'Đã qua 12:00 PM hôm nay'
        ELSE 'Chưa quá checkout'
    END as checkout_status
FROM bookinghotel.bookings 
WHERE id = 62;

