# Tích hợp Thanh toán MoMo v2

## Tổng quan

Module thanh toán MoMo v2 đã được tích hợp vào hệ thống booking hotel. Module này hỗ trợ thanh toán qua ví MoMo trên môi trường sandbox.

## Cấu hình

### File: `app/utils/momo.js`

Cấu hình MoMo Payment v2:
- **API Endpoint**: `https://test-payment.momo.vn/v2/gateway/api/create`
- **SecretKey**: `K951B6PE1waDMi640xX08PD3vg6EkVlz`
- **AccessKey**: `F8BBA842ECF85`
- **PartnerCode**: `MOMO`
- **PartnerName**: `Booking Hotel`
- **StoreId**: `BookingHotel`

### Biến môi trường

Thêm vào file `.env`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
(hoặc URL production của bạn)

## Luồng thanh toán

### 1. Tạo Booking và Payment Request

**Frontend**: `app/(home)/payment/page.jsx`
- User chọn phương thức thanh toán MoMo
- Tạo booking trước qua API `/api/bookings/pay`
- Gọi API `/api/payments/momo/create` để tạo payment request
- Redirect đến trang thanh toán MoMo

### 2. Xử lý Callback

**API**: `app/api/payments/momo/callback/route.js`
- MoMo redirect về sau khi thanh toán
- Verify signature
- Cập nhật booking status thành `paid`
- Redirect về trang success

### 3. Xử lý IPN (Instant Payment Notification)

**API**: `app/api/payments/momo/ipn/route.js`
- MoMo gửi IPN để đảm bảo booking được cập nhật
- Verify signature
- Cập nhật booking status nếu cần

## API Endpoints

### POST `/api/payments/momo/create`

Tạo payment request với MoMo.

**Request Body:**
```json
{
  "orderId": "MOMO_1234567890_32",
  "amount": 4444000,
  "orderInfo": "Thanh toan dat phong Standard Double - Booking ID: 32",
  "bookingId": 32,
  "extraData": "{\"bookingId\":32}"
}
```

**Response:**
```json
{
  "success": true,
  "payUrl": "https://test-payment.momo.vn/...",
  "orderId": "MOMO_1234567890_32",
  "requestId": "MOMO1234567890"
}
```

### GET `/api/payments/momo/callback`

Xử lý callback từ MoMo sau khi thanh toán.

**Query Parameters:**
- `resultCode`: Mã kết quả (0 = thành công)
- `orderId`: Mã đơn hàng
- `amount`: Số tiền
- `transId`: Mã giao dịch
- `signature`: Chữ ký
- `booking_id`: ID booking (từ query param)

### POST `/api/payments/momo/ipn`

Xử lý IPN từ MoMo.

**Request Body:**
```json
{
  "resultCode": "0",
  "orderId": "MOMO_1234567890_32",
  "amount": "4444000",
  "transId": "1234567890",
  "signature": "...",
  ...
}
```

## Cấu trúc Request Data

```javascript
{
  partnerCode: "MOMO",
  partnerName: "Booking Hotel",
  storeId: "BookingHotel",
  requestId: "MOMO1234567890",
  amount: "4444000",
  orderId: "MOMO_1234567890_32",
  orderInfo: "Thanh toan dat phong...",
  redirectUrl: "http://localhost:3000/api/payments/momo/callback?booking_id=32",
  ipnUrl: "http://localhost:3000/api/payments/momo/ipn",
  extraData: "eyJib29raW5nSWQiOjMyfQ==", // base64 encoded
  requestType: "captureWallet",
  autoCapture: true,
  lang: "vi",
  signature: "..." // HMAC SHA256
}
```

## Signature Format

Signature được tạo từ chuỗi các field sắp xếp theo alphabet:
```
accessKey={AccessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={PartnerCode}&partnerName={PartnerName}&redirectUrl={redirectUrl}&requestId={requestId}&storeId={StoreId}
```

Sau đó hash bằng HMAC SHA256 với SecretKey.

## Testing

### Môi trường Sandbox

1. Chọn phương thức thanh toán MoMo trên payment page
2. Sẽ redirect đến trang thanh toán MoMo sandbox
3. Sử dụng tài khoản test của MoMo để thanh toán
4. Sau khi thanh toán, sẽ redirect về trang success

### Kiểm tra Logs

Kiểm tra console log để xem:
- Request data được gửi đến MoMo
- Response từ MoMo API
- Signature được tạo
- URLs được sử dụng

## Lưu ý

1. **Base URL**: Đảm bảo `NEXT_PUBLIC_BASE_URL` được cấu hình đúng
2. **Signature**: Signature phải được tạo đúng format và thứ tự
3. **extraData**: Phải được base64 encode trước khi gửi
4. **Amount**: Phải là string trong request data
5. **URLs**: `redirectUrl` và `ipnUrl` không được để trống

## Troubleshooting

### Lỗi 400: Bad Request
- Kiểm tra signature có đúng không
- Kiểm tra các field bắt buộc có đầy đủ không
- Kiểm tra URLs có hợp lệ không

### Lỗi: Invalid signature
- Kiểm tra SecretKey có đúng không
- Kiểm tra thứ tự các field trong signature
- Kiểm tra extraData có được encode base64 đúng không

### Lỗi: URLs empty
- Kiểm tra `NEXT_PUBLIC_BASE_URL` có được cấu hình không
- Kiểm tra headers từ request có đầy đủ không








