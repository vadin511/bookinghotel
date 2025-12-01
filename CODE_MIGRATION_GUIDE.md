# Hướng Dẫn Cập Nhật Code Theo Schema Mới

## 📝 DANH SÁCH FILE CẦN SỬA

### 1. **API Routes - Users**

#### `app/api/login/route.js`
```javascript
// Đổi:
full_name: user.full_name → name: user.name
avatar_url: user.avatar_url → avatar: user.avatar
role_id: user.role_id → role: user.role
```

#### `app/api/profile/route.js`
```javascript
// Đổi:
full_name → name
avatar_url → avatar
```

#### `app/api/users/route.js`
```javascript
// Đổi:
full_name → name
```

#### `app/api/verify-otp/route.js`
```javascript
// Đổi:
full_name → name
avatar_url → avatar
role_id → role
```

---

### 2. **API Routes - Bookings** ⚠️ THAY ĐỔI LỚN

#### `app/api/bookings/route.js`
```javascript
// CŨ:
INSERT INTO bookings (user_id, room_id, check_in, check_out, status, total_price)
VALUES (?, ?, ?, ?, ?, ?)

// MỚI:
// Bước 1: Tạo booking
INSERT INTO bookings (user_id, hotel_id, check_in, check_out, status, total_price, payment_method)
VALUES (?, ?, ?, ?, ?, ?, ?)

// Bước 2: Tạo booking_details
INSERT INTO booking_details (booking_id, room_id, quantity, price_per_night, subtotal)
VALUES (?, ?, ?, ?, ?)
```

#### `app/api/bookings/route.js` - GET
```javascript
// CŨ:
SELECT b.*, r.name AS room_name, r.photos...
FROM bookings b
JOIN rooms r ON b.room_id = r.id

// MỚI:
SELECT b.*, 
       h.name AS hotel_name,
       GROUP_CONCAT(r.name) AS room_names,
       GROUP_CONCAT(bd.quantity) AS quantities
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN booking_details bd ON b.id = bd.booking_id
LEFT JOIN rooms r ON bd.room_id = r.id
GROUP BY b.id
```

#### `app/api/bookings/[id]/route.js`
- Cập nhật queries tương tự

---

### 3. **API Routes - Rooms**

#### `app/api/room/route.js`
```javascript
// Đổi:
max_guests → max_people
type_id → room_type_id
photos (JSON) → không lưu, dùng bảng room_photos
```

#### `app/api/rooms/search/route.js`
```javascript
// Đổi:
max_guests → max_people
// Thêm JOIN với room_photos để lấy ảnh
```

---

### 4. **API Routes - Hotels**

#### `app/api/hotel/route.js`
```javascript
// Đổi:
photos (JSON) → không lưu, dùng bảng hotel_photos
// Xóa: category_id, type_id, manager_id
```

---

### 5. **Redux & Components**

#### `app/store/features/userSlice.js`
- Cập nhật tất cả references: `full_name` → `name`, `avatar_url` → `avatar`, `role_id` → `role`

#### `components/common/header/HeaderAvatarBox.jsx`
```javascript
// Đổi:
user?.avatar → user?.avatar (nếu đã đổi tên cột)
user?.full_name → user?.name
```

#### `components/admin/header/Header.jsx`
```javascript
// Đổi:
user?.full_name → user?.name
user?.avatar_url → user?.avatar
user?.role_id → user?.role
```

#### `app/(home)/profile/page.jsx`
```javascript
// Đổi:
full_name → name
avatar_url → avatar
```

---

### 6. **Components - Bookings**

#### `app/(home)/checkout/page.jsx`
- Cần sửa logic: tạo booking với hotel_id, sau đó tạo booking_details với room_id

#### `app/(admin)/admin/bookingsManagement/page.jsx`
- Cập nhật queries để lấy thông tin từ booking_details

---

## 🔄 QUY TRÌNH MIGRATION

### Bước 1: Backup Database
```sql
mysqldump -u username -p database_name > backup.sql
```

### Bước 2: Chạy Migration Script
- Chạy `database_migration_script.sql` từng phần
- Test sau mỗi phần

### Bước 3: Cập Nhật Code
- Sửa từng file theo danh sách trên
- Test từng API endpoint

### Bước 4: Test Toàn Bộ
- Test đăng nhập/đăng ký
- Test tạo booking
- Test quản lý bookings
- Test upload avatar

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Bookings là thay đổi lớn nhất**: Cần test kỹ logic tạo booking mới
2. **Photos**: Cần migrate dữ liệu từ JSON sang bảng riêng
3. **Backup**: Luôn backup trước khi migrate
4. **Test từng phần**: Không sửa tất cả cùng lúc

---

## ✅ CHECKLIST

- [ ] Backup database
- [ ] Chạy migration script
- [ ] Cập nhật API users
- [ ] Cập nhật API bookings
- [ ] Cập nhật API rooms
- [ ] Cập nhật API hotels
- [ ] Cập nhật Redux slices
- [ ] Cập nhật Components
- [ ] Test đăng nhập
- [ ] Test đăng ký
- [ ] Test tạo booking
- [ ] Test quản lý bookings
- [ ] Test upload avatar





















