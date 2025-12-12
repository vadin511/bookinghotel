# Hướng dẫn Test Tự Hủy Booking

## Mục tiêu
Test để booking tự động chuyển sang:
- `status = 'cancelled'`
- `cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận'`
- `cancellation_type = 'system'`

---

## Bước 1: Chuẩn bị Database

### 1.1. Kiểm tra và sửa ENUM của cột `status`
```sql
-- Kiểm tra ENUM hiện tại
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'status';

-- Cập nhật ENUM nếu thiếu 'cancelled' và 'completed'
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') 
DEFAULT 'pending';
```

### 1.2. Kiểm tra và sửa cột `cancellation_type`
```sql
-- Kiểm tra cột cancellation_type
SELECT COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bookinghotel'
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'cancellation_type';

-- Nếu cột không tồn tại, thêm mới:
ALTER TABLE bookinghotel.bookings 
ADD COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL 
AFTER cancellation_reason;

-- Nếu cột đã tồn tại nhưng ENUM thiếu 'system', cập nhật:
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL;
```

---

## Bước 2: Tạo Booking Test

### 2.1. Tìm một booking để test (hoặc tạo mới)
```sql
-- Xem các booking hiện có
SELECT id, user_id, status, check_in, check_out, created_at
FROM bookinghotel.bookings
ORDER BY id DESC
LIMIT 5;
```

### 2.2. Cập nhật booking để test (ví dụ: booking ID 63)
```sql
-- Lưu ý: Thay đổi các giá trị sau cho phù hợp:
-- - id: ID của booking bạn muốn test
-- - user_id: ID của user bạn đang đăng nhập
-- - check_out: Đặt về quá khứ để test ngay (hoặc hôm nay sau 12:00 PM)

UPDATE bookinghotel.bookings
SET 
    status = 'pending',                    -- ⚠️ QUAN TRỌNG: Phải là 'pending'
    check_in = DATE_SUB(CURDATE(), INTERVAL 2 DAY),  -- 2 ngày trước
    check_out = DATE_SUB(CURDATE(), INTERVAL 1 DAY),  -- 1 ngày trước (đã quá checkout)
    created_at = DATE_SUB(CURDATE(), INTERVAL 3 DAY), -- 3 ngày trước
    cancellation_reason = NULL,           -- Xóa lý do hủy cũ nếu có
    cancellation_type = NULL               -- Xóa type hủy cũ nếu có
WHERE id = 63;  -- Thay 63 bằng ID booking bạn muốn test
```

### 2.3. Kiểm tra booking đã được cập nhật đúng chưa
```sql
SELECT 
    id, 
    user_id, 
    status, 
    check_in, 
    check_out, 
    created_at,
    cancellation_reason,
    cancellation_type,
    DATEDIFF(CURDATE(), DATE(check_out)) as days_after_checkout
FROM bookinghotel.bookings 
WHERE id = 63;
```

**Kết quả mong đợi:**
- `status = 'pending'`
- `check_out` = ngày đã qua (hoặc hôm nay sau 12:00 PM)
- `cancellation_reason = NULL`
- `cancellation_type = NULL`

---

## Bước 3: Test Tự Hủy

### 3.1. Đảm bảo bạn đang đăng nhập với user_id khớp với booking
- Booking phải thuộc về user đang đăng nhập
- Kiểm tra: `user_id` của booking = `id` của user đang đăng nhập

### 3.2. Mở Browser Console
1. Mở trang `/my-bookings` trong browser
2. Mở Developer Tools (F12)
3. Chuyển sang tab **Console**

### 3.3. Refresh trang
- Nhấn F5 hoặc Ctrl+R để refresh trang
- Quan sát console logs

### 3.4. Kiểm tra Console Logs
Bạn sẽ thấy các logs sau nếu tự hủy hoạt động:

```
[Auto Cancel] Tất cả bookings pending: [...]
[Auto Cancel] Booking 63 kiểm tra: {isPending: true, hasCheckOut: true, isAfter: true, isOwner: true, ...}
[isAfterCheckOut] So sánh: {...}
[isAfterCheckOut] ✅ Đã qua ngày checkout
[Auto Cancel] Số lượng bookings sẽ bị hủy: 1
[Auto Cancel] Danh sách bookings sẽ hủy: [63]
[System Auto Cancel] Đang hủy booking 63 - Status hiện tại: pending
[System Auto Cancel] ✅ Booking 63 đã được hủy thành công - Status: cancelled
```

---

## Bước 4: Kiểm tra Kết quả

### 4.1. Kiểm tra trong Database
```sql
SELECT 
    id, 
    status, 
    cancellation_reason, 
    cancellation_type,
    check_out,
    updated_at
FROM bookinghotel.bookings 
WHERE id = 63;
```

**Kết quả mong đợi:**
- ✅ `status = 'cancelled'`
- ✅ `cancellation_reason = 'Phòng đã bị hủy do chưa được xác nhận'`
- ✅ `cancellation_type = 'system'`

### 4.2. Kiểm tra trên UI
- Refresh trang `/my-bookings`
- Booking sẽ hiển thị:
  - Badge màu đỏ: "Đã hủy"
  - Thông tin: "Hệ thống tự động hủy (quá hạn)"
  - Lý do: "Phòng đã bị hủy do chưa được xác nhận"

---

## Bước 5: Xử lý Lỗi (Nếu có)

### Lỗi 1: "Giá trị status 'cancelled' không hợp lệ"
**Nguyên nhân:** ENUM của `status` thiếu `'cancelled'`
**Giải pháp:** Chạy lại Bước 1.1

### Lỗi 2: "Data truncated for column 'cancellation_type'"
**Nguyên nhân:** Cột `cancellation_type` không tồn tại hoặc ENUM thiếu `'system'`
**Giải pháp:** Chạy lại Bước 1.2

### Lỗi 3: Booking không tự hủy
**Kiểm tra:**
1. `status` có phải `'pending'` không?
2. `check_out` đã quá 12:00 PM chưa?
3. `user_id` của booking có khớp với user đang đăng nhập không?
4. Có lỗi gì trong console không?

**Giải pháp:**
- Kiểm tra lại Bước 2.2
- Xem console logs để debug
- Đảm bảo `check_out` đã quá (có thể set về quá khứ để test)

---

## Test Nhanh (Tất cả trong một)

```sql
-- 1. Sửa ENUM status
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') 
DEFAULT 'pending';

-- 2. Sửa ENUM cancellation_type (nếu cột chưa có thì thêm mới)
ALTER TABLE bookinghotel.bookings 
ADD COLUMN IF NOT EXISTS cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL 
AFTER cancellation_reason;

-- Hoặc nếu cột đã có:
ALTER TABLE bookinghotel.bookings 
MODIFY COLUMN cancellation_type ENUM('admin', 'user', 'system') NULL DEFAULT NULL;

-- 3. Tạo booking test (thay 63 và user_id cho phù hợp)
UPDATE bookinghotel.bookings
SET 
    status = 'pending',
    check_in = DATE_SUB(CURDATE(), INTERVAL 2 DAY),
    check_out = DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    created_at = DATE_SUB(CURDATE(), INTERVAL 3 DAY),
    cancellation_reason = NULL,
    cancellation_type = NULL
WHERE id = 63;

-- 4. Kiểm tra
SELECT id, status, cancellation_reason, cancellation_type
FROM bookinghotel.bookings 
WHERE id = 63;
```

Sau đó refresh trang `/my-bookings` và kiểm tra kết quả!

