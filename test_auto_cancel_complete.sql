-- ============================================
-- SCRIPT TEST TỰ HỦY BOOKING - TẤT CẢ TRONG MỘT
-- ============================================
-- Mục tiêu: Test để booking tự động chuyển sang:
--   - status = 'cancelled'
--   - cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận'
--   - cancellation_type = 'system'

-- ============================================
-- BƯỚC 1: SỬA ENUM STATUS
-- ============================================
-- Kiểm tra ENUM hiện tại
SELECT 
    'BƯỚC 1: Kiểm tra ENUM status' as step,
    COLUMN_TYPE as current_enum
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- Cập nhật ENUM (chạy lệnh này)
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') 
DEFAULT 'pending';

-- Kiểm tra lại
SELECT 
    'ENUM status sau khi sửa' as step,
    COLUMN_TYPE as updated_enum
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- ============================================
-- BƯỚC 2: SỬA CỘT CANCELLATION_TYPE
-- ============================================
-- Kiểm tra cột cancellation_type
SELECT 
    'BƯỚC 2: Kiểm tra cột cancellation_type' as step,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'cancellation_type';

-- Nếu cột không tồn tại, thêm mới (chạy lệnh này nếu cột chưa có)
-- ALTER TABLE bookinghotel.bookings 
-- ADD COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL 
-- AFTER cancellation_reason;

-- Nếu cột đã tồn tại, cập nhật ENUM (chạy lệnh này)
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL;

-- Kiểm tra lại
SELECT 
    'Cột cancellation_type sau khi sửa' as step,
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'cancellation_type';

-- ============================================
-- BƯỚC 3: TẠO BOOKING TEST
-- ============================================
-- ⚠️ QUAN TRỌNG: Thay đổi các giá trị sau cho phù hợp:
--   - id: ID của booking bạn muốn test (ví dụ: 63)
--   - user_id: ID của user bạn đang đăng nhập

-- Xem các booking hiện có để chọn ID
SELECT 
    'BƯỚC 3: Danh sách bookings để test' as step,
    id, 
    user_id, 
    status, 
    check_in, 
    check_out
FROM bookinghotel.bookings
ORDER BY id DESC
LIMIT 10;

-- Cập nhật booking để test (THAY ĐỔI id và user_id cho phù hợp!)
UPDATE bookinghotel.bookings
SET 
    status = 'pending',                    -- ⚠️ QUAN TRỌNG: Phải là 'pending'
    check_in = DATE_SUB(CURDATE(), INTERVAL 2 DAY),  -- 2 ngày trước
    check_out = DATE_SUB(CURDATE(), INTERVAL 1 DAY),  -- 1 ngày trước (đã quá checkout)
    created_at = DATE_SUB(CURDATE(), INTERVAL 3 DAY), -- 3 ngày trước
    cancellation_reason = NULL,           -- Xóa lý do hủy cũ
    cancellation_type = NULL              -- Xóa type hủy cũ
WHERE id = 63;  -- ⚠️ THAY ĐỔI: ID booking bạn muốn test

-- Kiểm tra booking đã được cập nhật
SELECT 
    'Booking test sau khi cập nhật' as step,
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
        ELSE '❌ Chưa quá checkout'
    END as checkout_status
FROM bookinghotel.bookings 
WHERE id = 63;  -- ⚠️ THAY ĐỔI: ID booking bạn muốn test

-- ============================================
-- BƯỚC 4: SAU KHI TEST - KIỂM TRA KẾT QUẢ
-- ============================================
-- Sau khi refresh trang /my-bookings, chạy query này để kiểm tra kết quả:
SELECT 
    'KẾT QUẢ SAU KHI TỰ HỦY' as step,
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
        ELSE '❌ CHƯA ĐÚNG - Kiểm tra lại'
    END as test_result
FROM bookinghotel.bookings 
WHERE id = 63;  -- ⚠️ THAY ĐỔI: ID booking bạn đang test

-- ============================================
-- HƯỚNG DẪN TEST:
-- ============================================
-- 1. Chạy tất cả các lệnh ALTER TABLE ở trên
-- 2. Chạy UPDATE để tạo booking test (nhớ thay id và user_id)
-- 3. Mở browser, đăng nhập với user_id khớp với booking
-- 4. Mở trang /my-bookings
-- 5. Mở Developer Tools (F12) → Console
-- 6. Refresh trang (F5)
-- 7. Quan sát console logs
-- 8. Chạy query kiểm tra kết quả ở BƯỚC 4
-- 9. Kết quả mong đợi:
--    - status = 'cancelled'
--    - cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận'
--    - cancellation_type = 'system'

