-- ============================================
-- MIGRATION SCRIPT: Chuyển đổi từ schema cũ sang schema mới
-- ============================================

-- LƯU Ý: Backup database trước khi chạy script này!

-- ============================================
-- 1. TẠO CÁC BẢNG MỚI (nếu chưa có)
-- ============================================

-- Tạo bảng room_types nếu chưa có
CREATE TABLE IF NOT EXISTS room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Tạo bảng hotel_photos nếu chưa có
CREATE TABLE IF NOT EXISTS hotel_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Tạo bảng room_photos nếu chưa có
CREATE TABLE IF NOT EXISTS room_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Tạo bảng booking_details nếu chưa có
CREATE TABLE IF NOT EXISTS booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_per_night DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ============================================
-- 2. MIGRATE DỮ LIỆU PHOTOS
-- ============================================

-- Migrate hotel photos từ JSON sang bảng hotel_photos
-- (Chạy sau khi đã có dữ liệu trong hotels.photos dạng JSON)
-- INSERT INTO hotel_photos (hotel_id, photo_url)
-- SELECT 
--     h.id,
--     JSON_UNQUOTE(JSON_EXTRACT(h.photos, CONCAT('$[', n.n, ']')))
-- FROM hotels h
-- CROSS JOIN (
--     SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
-- ) n
-- WHERE JSON_EXTRACT(h.photos, CONCAT('$[', n.n, ']')) IS NOT NULL;

-- Migrate room photos từ JSON sang bảng room_photos
-- INSERT INTO room_photos (room_id, photo_url)
-- SELECT 
--     r.id,
--     JSON_UNQUOTE(JSON_EXTRACT(r.photos, CONCAT('$[', n.n, ']')))
-- FROM rooms r
-- CROSS JOIN (
--     SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
-- ) n
-- WHERE JSON_EXTRACT(r.photos, CONCAT('$[', n.n, ']')) IS NOT NULL;

-- ============================================
-- 3. MIGRATE BOOKINGS
-- ============================================

-- Thêm cột hotel_id vào bookings nếu chưa có
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS hotel_id INT,
ADD COLUMN IF NOT EXISTS payment_method ENUM('cod','bank','momo') DEFAULT 'cod';

-- Cập nhật hotel_id từ room_id
UPDATE bookings b
JOIN rooms r ON b.room_id = r.id
SET b.hotel_id = r.hotel_id
WHERE b.hotel_id IS NULL;

-- Tạo booking_details từ bookings cũ
INSERT INTO booking_details (booking_id, room_id, quantity, price_per_night, subtotal)
SELECT 
    b.id,
    b.room_id,
    1 as quantity,
    COALESCE(r.price_per_night, 0) as price_per_night,
    COALESCE(b.total_price, 0) as subtotal
FROM bookings b
LEFT JOIN rooms r ON b.room_id = r.id
WHERE NOT EXISTS (
    SELECT 1 FROM booking_details bd WHERE bd.booking_id = b.id
);

-- ============================================
-- 4. RENAME COLUMNS (nếu cần)
-- ============================================

-- Đổi full_name → name trong users
-- ALTER TABLE users CHANGE COLUMN full_name name VARCHAR(100) NOT NULL;

-- Đổi avatar_url → avatar trong users
-- ALTER TABLE users CHANGE COLUMN avatar_url avatar VARCHAR(255);

-- Đổi role_id → role trong users
-- ALTER TABLE users CHANGE COLUMN role_id role ENUM('user','admin') DEFAULT 'user';

-- Đổi max_guests → max_people trong rooms
-- ALTER TABLE rooms CHANGE COLUMN max_guests max_people INT;

-- Đổi type_id → room_type_id trong rooms
-- ALTER TABLE rooms CHANGE COLUMN type_id room_type_id INT;

-- ============================================
-- 5. THÊM CÁC CỘT MỚI (nếu chưa có)
-- ============================================

-- Thêm các cột mới vào users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender ENUM('male','female','other'),
ADD COLUMN IF NOT EXISTS address VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(15),
ADD COLUMN IF NOT EXISTS status ENUM('active','blocked') DEFAULT 'active';

-- ============================================
-- 6. XÓA CÁC CỘT KHÔNG CẦN THIẾT (SAU KHI MIGRATE XONG)
-- ============================================

-- CHỈ CHẠY SAU KHI ĐÃ MIGRATE XONG VÀ TEST KỸ!
-- ALTER TABLE hotels DROP COLUMN photos;
-- ALTER TABLE rooms DROP COLUMN photos;
-- ALTER TABLE bookings DROP COLUMN room_id; -- CHỈ XÓA SAU KHI ĐÃ TẠO booking_details








