-- Tạo bảng banners để quản lý banner slider
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) DEFAULT NULL COMMENT 'Tiêu đề banner (tùy chọn)',
  image_url VARCHAR(500) NOT NULL COMMENT 'URL ảnh banner',
  link VARCHAR(500) DEFAULT NULL COMMENT 'URL khi click vào banner (tùy chọn)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1: hiển thị, 0: ẩn',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_banners_active ON banners(is_active);

