-- Script để kiểm tra và sửa cột cancellation_type trong bảng bookings
-- Lỗi: "Data truncated for column 'cancellation_type' at row 1"
-- Nguyên nhân: Cột cancellation_type không tồn tại hoặc ENUM không có giá trị 'system'

-- 1. Kiểm tra xem cột cancellation_type có tồn tại không
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'cancellation_type';

-- 2. Nếu cột không tồn tại, thêm mới
-- Chạy lệnh này nếu cột chưa tồn tại:
ALTER TABLE bookinghotel.bookings 
ADD COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL 
AFTER cancellation_reason;

-- 3. Nếu cột đã tồn tại nhưng ENUM không có 'system', cập nhật ENUM
-- Chạy lệnh này nếu cột đã tồn tại:
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL;

-- 4. Kiểm tra lại sau khi cập nhật
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'cancellation_type';

-- 5. Kiểm tra các booking đã hủy có cancellation_type không
SELECT 
    id, 
    status, 
    cancellation_reason, 
    cancellation_type
FROM bookinghotel.bookings 
WHERE status = 'cancelled' 
ORDER BY id DESC 
LIMIT 10;

