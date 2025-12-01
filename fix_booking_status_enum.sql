-- Script để kiểm tra và cập nhật ENUM cho cột status trong bảng bookings

-- 1. Kiểm tra ENUM values hiện tại
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- 2. Nếu cần, thêm giá trị 'cancelled' và 'completed' vào ENUM
-- Lưu ý: MySQL không hỗ trợ ALTER ENUM trực tiếp, cần MODIFY COLUMN
-- Thay thế toàn bộ ENUM với các giá trị mới

ALTER TABLE bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') 
DEFAULT 'pending';

-- 3. Kiểm tra lại sau khi cập nhật
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

