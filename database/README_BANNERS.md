# Hướng dẫn tạo bảng Banners

## Bước 1: Tạo bảng trong database

Chạy file SQL sau trong MySQL Workbench hoặc MySQL CLI:

```sql
-- File: database/create_banners_table.sql
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) DEFAULT NULL COMMENT 'Tiêu đề banner (tùy chọn)',
  image_url VARCHAR(500) NOT NULL COMMENT 'URL ảnh banner',
  link_url VARCHAR(500) DEFAULT NULL COMMENT 'URL khi click vào banner (tùy chọn)',
  display_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị (số nhỏ hơn hiển thị trước)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1: hiển thị, 0: ẩn',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_banners_active_order ON banners(is_active, display_order);
```

## Bước 2: Kiểm tra bảng đã được tạo

Chạy query sau để kiểm tra:

```sql
SHOW TABLES LIKE 'banners';
DESCRIBE banners;
```

## Bước 3: Test API

Sau khi tạo bảng, thử truy cập:
- GET: `http://localhost:3000/api/banners`
- Nếu có lỗi, kiểm tra console của server để xem chi tiết lỗi

## Lưu ý

- Đảm bảo database connection đã được cấu hình đúng trong `.env`
- Kiểm tra các biến môi trường: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`




