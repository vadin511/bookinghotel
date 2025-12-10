-- Script để thêm cột cancellation_type vào bảng bookings
-- cancellation_type: ENUM('admin', 'user', 'system') - NULL nếu chưa hủy
-- system: Hệ thống tự động hủy (quá hạn)

-- 1. Thêm cột cancellation_type (nếu chưa có)
-- Nếu cột đã tồn tại với ENUM cũ, cần ALTER để thay đổi ENUM
ALTER TABLE bookings 
MODIFY COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL;

-- Nếu cột chưa tồn tại, thêm mới:
-- ALTER TABLE bookings 
-- ADD COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL 
-- AFTER cancellation_reason;

-- 2. Cập nhật các booking đã hủy hiện tại (nếu có cancellation_reason)
-- Nếu có cancellation_reason nhưng chưa có cancellation_type, set mặc định
-- Dựa vào cancellation_reason để đoán:
-- - Nếu có "chưa được xác nhận" hoặc "quá hạn" -> system
-- - Các trường hợp khác sẽ để NULL (cần admin xác định lại)

UPDATE bookings 
SET cancellation_type = 'system' 
WHERE status = 'cancelled' 
  AND cancellation_reason IS NOT NULL 
  AND cancellation_reason LIKE '%chưa được xác nhận%'
  AND cancellation_type IS NULL;

-- 3. Kiểm tra kết quả
SELECT 
  id, 
  status, 
  cancellation_reason, 
  cancellation_type,
  created_at
FROM bookings 
WHERE status = 'cancelled' 
ORDER BY created_at DESC 
LIMIT 10;







