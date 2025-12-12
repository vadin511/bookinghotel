# Hướng dẫn Setup Cron Job để Tự Động Hủy Booking Quá Hạn

## Vấn đề
Hiện tại, hệ thống chỉ tự động hủy booking pending quá hạn khi:
- Admin truy cập trang quản lý booking
- User truy cập trang my-bookings

Để tự động hủy booking quá hạn mà không cần người dùng truy cập, bạn cần setup cron job.

## Giải pháp

### 1. API Endpoint đã được tạo
Endpoint: `POST /api/bookings/auto-cancel-cron`

Endpoint này có thể được gọi tự động bởi cron job hoặc scheduled task.

### 2. Bảo mật
Endpoint yêu cầu secret key trong header:
```
Authorization: Bearer YOUR_SECRET_KEY
```

Thêm vào file `.env`:
```
CRON_SECRET_KEY=your-very-secure-secret-key-here
```

Hoặc nếu không có `CRON_SECRET_KEY`, sẽ dùng `ADMIN_SECRET_KEY`.

### 3. Các cách setup Cron Job

#### Cách 1: Sử dụng Vercel Cron Jobs (Nếu deploy trên Vercel)

Tạo file `vercel.json` trong root project:

```json
{
  "crons": [
    {
      "path": "/api/bookings/auto-cancel-cron",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Lịch trình: Chạy mỗi ngày lúc 2:00 AM (UTC)

Thêm header trong Vercel Cron config:
- Header: `Authorization`
- Value: `Bearer YOUR_SECRET_KEY`

#### Cách 2: Sử dụng External Cron Service (cron-job.org, EasyCron, etc.)

1. Đăng ký tài khoản tại một trong các dịch vụ:
   - https://cron-job.org (miễn phí)
   - https://www.easycron.com
   - https://crontab.guru (chỉ để test)

2. Tạo cron job mới:
   - **URL**: `https://your-domain.com/api/bookings/auto-cancel-cron`
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_SECRET_KEY
     Content-Type: application/json
     ```
   - **Schedule**: `0 2 * * *` (chạy mỗi ngày lúc 2:00 AM)
   - Hoặc `0 */6 * * *` (chạy mỗi 6 giờ một lần)

#### Cách 3: Sử dụng Server Cron (Nếu có quyền truy cập server)

Thêm vào crontab của server:

```bash
# Chạy mỗi ngày lúc 2:00 AM
0 2 * * * curl -X POST https://your-domain.com/api/bookings/auto-cancel-cron -H "Authorization: Bearer YOUR_SECRET_KEY" -H "Content-Type: application/json"
```

#### Cách 4: Sử dụng Node.js Cron Package (Nếu chạy trên server riêng)

Cài đặt package:
```bash
npm install node-cron
```

Tạo file `cron.js`:
```javascript
const cron = require('node-cron');
const https = require('https');

const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Chạy mỗi ngày lúc 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running auto-cancel cron job...');
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(`${API_URL}/api/bookings/auto-cancel-cron`, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Cron job result:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Cron job error:', error);
  });

  req.end();
});
```

Chạy: `node cron.js`

## Testing

### Test endpoint bằng curl:
```bash
curl -X POST https://your-domain.com/api/bookings/auto-cancel-cron \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Test endpoint bằng GET (chỉ xem, không hủy):
```bash
curl -X GET https://your-domain.com/api/bookings/auto-cancel-cron \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

## Lưu ý

1. **Bảo mật**: Không bao giờ commit secret key vào git. Luôn dùng environment variables.

2. **Timezone**: Cron job thường chạy theo UTC. Điều chỉnh schedule phù hợp với timezone của bạn.

3. **Frequency**: 
   - Chạy mỗi ngày một lần (2:00 AM) là đủ cho hầu hết trường hợp
   - Nếu cần kiểm tra thường xuyên hơn, có thể chạy mỗi 6 giờ: `0 */6 * * *`

4. **Monitoring**: Kiểm tra logs để đảm bảo cron job chạy đúng.

5. **Error Handling**: Endpoint đã có error handling, nhưng nên monitor để đảm bảo không có lỗi.

## Troubleshooting

- **401 Unauthorized**: Kiểm tra secret key trong header và environment variable
- **500 Error**: Kiểm tra database connection và logs
- **Cron không chạy**: Kiểm tra schedule và service status





