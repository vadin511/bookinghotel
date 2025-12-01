-- Migration: Thêm cột updated_at vào bảng bookings
-- Chạy file này trong MySQL để cập nhật database

-- Lưu ý: Nếu cột updated_at đã tồn tại, câu lệnh này sẽ báo lỗi
-- Bạn có thể bỏ qua lỗi hoặc chạy câu lệnh kiểm tra trước

-- Cách 1: Thêm cột trực tiếp (sẽ lỗi nếu cột đã tồn tại)
ALTER TABLE bookings 
ADD COLUMN updated_at DATETIME NULL DEFAULT NULL 
AFTER created_at;

-- Cách 2: Kiểm tra trước khi thêm (chạy trong MySQL Workbench hoặc phpMyAdmin)
-- SELECT COUNT(*) FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = 'your_database_name' 
-- AND TABLE_NAME = 'bookings' 
-- AND COLUMN_NAME = 'updated_at';

-- Nếu kết quả = 0, thì chạy câu lệnh ALTER TABLE ở trên

-- Cập nhật giá trị updated_at cho các booking đã có (tùy chọn)
-- UPDATE bookings SET updated_at = created_at WHERE updated_at IS NULL;

