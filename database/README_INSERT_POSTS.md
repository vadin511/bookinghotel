# Hướng Dẫn Thêm Bài Viết Vào MySQL

## Cách 1: MySQL Workbench (Khuyến nghị)

1. Mở MySQL Workbench
2. Kết nối với database của bạn
3. Chọn database `bookinghotel` (hoặc chạy `USE bookinghotel;`)
4. Mở file SQL:
   - **File** → **Open SQL Script**
   - Chọn file `database/insert_sample_posts.sql`
5. Chạy script:
   - Nhấn nút **Execute** (⚡) hoặc **Ctrl+Shift+Enter**
   - Hoặc chọn toàn bộ nội dung và nhấn Execute

## Cách 2: Command Line (MySQL CLI)

Mở Terminal/Command Prompt và chạy:

```bash
# Windows (PowerShell hoặc CMD)
mysql -u [username] -p bookinghotel < database/insert_sample_posts.sql

# Hoặc nếu đã login vào MySQL:
mysql> USE bookinghotel;
mysql> SOURCE database/insert_sample_posts.sql;
```

**Ví dụ:**
```bash
mysql -u root -p bookinghotel < database/insert_sample_posts.sql
```

## Cách 3: Copy & Paste Trực Tiếp

1. Mở MySQL Workbench hoặc MySQL CLI
2. Chọn database `bookinghotel`
3. Copy toàn bộ nội dung từ file `insert_sample_posts.sql`
4. Paste vào query editor và chạy

## Kiểm Tra Kết Quả

Sau khi chạy script, bạn có thể kiểm tra bằng:

```sql
-- Xem số lượng bài viết
SELECT COUNT(*) as total_posts FROM posts;

-- Xem tất cả bài viết
SELECT * FROM posts ORDER BY created_at DESC;

-- Xem bài viết theo danh mục
SELECT category, COUNT(*) as count FROM posts GROUP BY category;
```

## Lưu Ý

- Script sẽ thêm 5 bài viết mẫu về du lịch vào bảng `posts`
- Nếu bạn muốn xóa dữ liệu cũ trước khi thêm, bỏ comment dòng `-- DELETE FROM posts;` ở đầu file
- Đảm bảo bảng `posts` đã được tạo với các cột: `id`, `title`, `content`, `image`, `category`, `created_at`



