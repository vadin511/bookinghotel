-- Script để thay đổi kiểu dữ liệu của cột map_url sang TEXT
-- Chạy script này trong MySQL để cho phép lưu URL dài hơn

-- Kiểm tra cấu trúc hiện tại
-- DESCRIBE hotels;

-- Thay đổi kiểu dữ liệu của cột map_url từ VARCHAR sang TEXT
ALTER TABLE hotels MODIFY COLUMN map_url TEXT;

-- Hoặc nếu muốn hỗ trợ URL rất dài, sử dụng LONGTEXT:
-- ALTER TABLE hotels MODIFY COLUMN map_url LONGTEXT;

-- Kiểm tra lại cấu trúc sau khi thay đổi
-- DESCRIBE hotels;





