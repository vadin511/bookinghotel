# Phân tích Database Schema Mới vs Code Hiện Tại

## ⚠️ CÁC KHÁC BIỆT QUAN TRỌNG

### 1. **USERS Table**
**Code hiện tại dùng:**
- `full_name` → Schema mới: `name` ✅
- `avatar_url` → Schema mới: `avatar` ✅
- `role_id` → Schema mới: `role` ✅

**Schema mới có thêm:**
- `gender` (ENUM: 'male','female','other')
- `address` (VARCHAR)
- `phone` (VARCHAR)
- `status` (ENUM: 'active','blocked')

**Cần sửa code:**
- Đổi `full_name` → `name`
- Đổi `avatar_url` → `avatar`
- Đổi `role_id` → `role`

---

### 2. **BOOKINGS Table** ⚠️ THAY ĐỔI LỚN
**Code hiện tại:**
```sql
bookings (user_id, room_id, check_in, check_out, status, total_price)
```

**Schema mới:**
```sql
bookings (user_id, hotel_id, total_price, payment_method, check_in, check_out, status)
booking_details (booking_id, room_id, quantity, price_per_night, subtotal)
```

**Vấn đề:**
- ❌ Code hiện tại lưu `room_id` trực tiếp trong `bookings`
- ✅ Schema mới tách ra: `bookings` chỉ có `hotel_id`, chi tiết phòng lưu trong `booking_details`
- ✅ Schema mới hỗ trợ đặt nhiều phòng trong 1 booking (quantity)
- ✅ Schema mới có `payment_method`

**Cần sửa:**
- Thay đổi logic tạo booking: tạo booking trước, sau đó tạo booking_details
- Cập nhật tất cả queries liên quan đến bookings

---

### 3. **ROOMS Table**
**Code hiện tại dùng:**
- `max_guests` → Schema mới: `max_people` ✅
- `photos` (JSON) → Schema mới: bảng `room_photos` riêng ⚠️
- `type_id` → Schema mới: `room_type_id` ✅

**Cần sửa:**
- Đổi `max_guests` → `max_people`
- Đổi `type_id` → `room_type_id`
- Thay đổi cách lưu photos: không dùng JSON, dùng bảng `room_photos`

---

### 4. **HOTELS Table**
**Code hiện tại dùng:**
- `photos` (JSON) → Schema mới: bảng `hotel_photos` riêng ⚠️
- `category_id`, `type_id`, `manager_id` → Schema mới: KHÔNG CÓ ⚠️

**Cần sửa:**
- Thay đổi cách lưu photos: dùng bảng `hotel_photos`
- Xóa hoặc migrate `category_id`, `type_id`, `manager_id` nếu cần

---

### 5. **ROOM_TYPES Table** ✅ MỚI
- Schema mới có bảng `room_types` riêng
- Code hiện tại có thể đang dùng `type_id` nhưng không có bảng riêng

---

## 📋 KẾT LUẬN

### ✅ HỢP LÝ:
- Schema mới **tốt hơn** về mặt thiết kế:
  - Tách photos ra bảng riêng (normalization)
  - Hỗ trợ đặt nhiều phòng trong 1 booking
  - Có thêm các trường hữu ích (gender, address, phone, payment_method)

### ⚠️ CẦN ĐIỀU CHỈNH:
1. **Mapping tên cột** (full_name → name, avatar_url → avatar, role_id → role)
2. **Thay đổi cấu trúc bookings** (tách room_id ra booking_details)
3. **Thay đổi cách lưu photos** (từ JSON sang bảng riêng)
4. **Cập nhật tất cả API endpoints** liên quan

### 💡 KHUYẾN NGHỊ:
1. **Tạo migration script** để chuyển đổi dữ liệu
2. **Cập nhật code từng phần** để tránh lỗi
3. **Test kỹ** các chức năng booking vì thay đổi lớn nhất








