import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export async function sendOTPEmail(to, otp) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: to,
    subject: 'Mã xác thực OTP',
    text: `Mã OTP của bạn là: ${otp}`,
  });
}

export async function sendPasswordChangeEmail(to) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: to,
    subject: 'Cảnh báo',
    text: `Cảnh báo : Tài khoản của bạn vừa thay đổi mật khẩu`,
  });
}

export async function sendBookingConfirmationEmail(to, bookingData) {
  const { 
    booking_id, 
    user_name, 
    hotel_name, 
    room_name, 
    check_in, 
    check_out, 
    total_price,
    nights 
  } = bookingData;

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const checkInFormatted = formatDate(check_in);
  const checkOutFormatted = formatDate(check_out);
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(total_price);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Xin chào <strong>${user_name}</strong>,</p>
      <p>Cảm ơn bạn đã đặt phòng tại hệ thống của chúng tôi. Đặt phòng của bạn đã được tiếp nhận .</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Thông tin đặt phòng</h3>
        <p><strong>Mã đặt phòng:</strong> #${booking_id}</p>
        <p><strong>Khách sạn:</strong> ${hotel_name}</p>
        <p><strong>Phòng:</strong> ${room_name}</p>
        <p><strong>Ngày nhận phòng:</strong> ${checkInFormatted}</p>
        <p><strong>Ngày trả phòng:</strong> ${checkOutFormatted}</p>
        <p><strong>Số đêm:</strong> ${nights} đêm</p>
        <p><strong>Tổng tiền:</strong> ${priceFormatted} VNĐ</p>
      </div>

      <p>Vui lòng đến đúng thời gian đã đặt để nhận phòng. Nếu có thay đổi, vui lòng liên hệ với chúng tôi sớm nhất có thể.</p>
      
      <p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: to,
    subject: 'Tiếp nhận đặt phòng!',
    html: htmlContent,
    text: `

Xin chào ${user_name},

Cảm ơn bạn đã đặt phòng tại hệ thống của chúng tôi.

Thông tin đặt phòng:
- Mã đặt phòng: #${booking_id}
- Khách sạn: ${hotel_name}
- Phòng: ${room_name}
- Ngày nhận phòng: ${checkInFormatted}
- Ngày trả phòng: ${checkOutFormatted}
- Số đêm: ${nights} đêm
- Tổng tiền: ${priceFormatted} VNĐ

Vui lòng đến đúng thời gian đã đặt để nhận phòng.

Trân trọng,
Đội ngũ hỗ trợ khách hàng
    `,
  });
}

export async function sendBookingCancellationEmailToAdmin(adminEmail, bookingData) {
  const { 
    booking_id, 
    user_name,
    user_email,
    hotel_name, 
    room_name, 
    check_in, 
    check_out, 
    total_price,
    nights,
    cancellation_reason,
    cancellation_type // 'manual' hoặc 'auto'
  } = bookingData;

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const checkInFormatted = formatDate(check_in);
  const checkOutFormatted = formatDate(check_out);
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(total_price);
  const cancellationTypeText = cancellation_type === 'auto' 
    ? 'Tự động hủy do quá thời gian' 
    : 'Hủy thủ công';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Thông báo: Đặt phòng đã bị hủy</h2>
      <p>Xin chào Quản trị viên,</p>
      <p>Hệ thống thông báo có một đặt phòng đã bị hủy với thông tin như sau:</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #991b1b;">Thông tin đặt phòng đã hủy</h3>
        <p><strong>Mã đặt phòng:</strong> #${booking_id}</p>
        <p><strong>Khách hàng:</strong> ${user_name} (${user_email})</p>
        <p><strong>Khách sạn:</strong> ${hotel_name}</p>
        <p><strong>Phòng:</strong> ${room_name}</p>
        <p><strong>Ngày nhận phòng:</strong> ${checkInFormatted}</p>
        <p><strong>Ngày trả phòng:</strong> ${checkOutFormatted}</p>
        <p><strong>Số đêm:</strong> ${nights} đêm</p>
        <p><strong>Tổng tiền:</strong> ${priceFormatted} VNĐ</p>
        <p><strong>Loại hủy:</strong> ${cancellationTypeText}</p>
        ${cancellation_reason ? `<p><strong>Lý do hủy:</strong> ${cancellation_reason}</p>` : ''}
      </div>

      <p style="color: #991b1b;"><strong>Vui lòng kiểm tra và xử lý theo quy trình của hệ thống.</strong></p>
      
      <p>Trân trọng,<br>Hệ thống quản lý đặt phòng</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: adminEmail,
    subject: `[Thông báo] Đặt phòng #${booking_id} đã bị hủy`,
    html: htmlContent,
    text: `
⚠️ Thông báo: Đặt phòng đã bị hủy

Xin chào Quản trị viên,

Hệ thống thông báo có một đặt phòng đã bị hủy với thông tin như sau:

Thông tin đặt phòng đã hủy:
- Mã đặt phòng: #${booking_id}
- Khách hàng: ${user_name} (${user_email})
- Khách sạn: ${hotel_name}
- Phòng: ${room_name}
- Ngày nhận phòng: ${checkInFormatted}
- Ngày trả phòng: ${checkOutFormatted}
- Số đêm: ${nights} đêm
- Tổng tiền: ${priceFormatted} VNĐ
- Loại hủy: ${cancellationTypeText}
${cancellation_reason ? `- Lý do hủy: ${cancellation_reason}` : ''}

Vui lòng kiểm tra và xử lý theo quy trình của hệ thống.

Trân trọng,
Hệ thống quản lý đặt phòng
    `,
  });
}

export async function sendBookingCancellationEmailToUser(userEmail, bookingData) {
  const { 
    booking_id, 
    user_name,
    hotel_name, 
    room_name, 
    check_in, 
    check_out, 
    total_price,
    nights,
    cancellation_reason,
    cancelled_by // 'admin' hoặc 'user'
  } = bookingData;

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const checkInFormatted = formatDate(check_in);
  const checkOutFormatted = formatDate(check_out);
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(total_price);
  const cancelledByText = cancelled_by === 'admin' 
    ? 'Quản trị viên đã hủy đặt phòng của bạn' 
    : 'Bạn đã hủy đặt phòng';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Thông báo: Đặt phòng đã bị hủy</h2>
      <p>Xin chào <strong>${user_name}</strong>,</p>
      <p>Chúng tôi thông báo rằng đặt phòng của bạn đã bị hủy với thông tin như sau:</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #991b1b;">Thông tin đặt phòng đã hủy</h3>
        <p><strong>Mã đặt phòng:</strong> #${booking_id}</p>
        <p><strong>Khách sạn:</strong> ${hotel_name}</p>
        <p><strong>Phòng:</strong> ${room_name}</p>
        <p><strong>Ngày nhận phòng:</strong> ${checkInFormatted}</p>
        <p><strong>Ngày trả phòng:</strong> ${checkOutFormatted}</p>
        <p><strong>Số đêm:</strong> ${nights} đêm</p>
        <p><strong>Tổng tiền:</strong> ${priceFormatted} VNĐ</p>
        <p><strong>Người hủy:</strong> ${cancelledByText}</p>
        ${cancellation_reason ? `<p><strong>Lý do hủy:</strong> ${cancellation_reason}</p>` : ''}
      </div>

      ${cancelled_by === 'admin' 
        ? '<p>Nếu bạn có bất kỳ thắc mắc nào về việc hủy đặt phòng này, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>'
        : '<p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chúng tôi hy vọng được phục vụ bạn trong tương lai.</p>'
      }
      
      <p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject: `[Thông báo] Đặt phòng #${booking_id} đã bị hủy`,
    html: htmlContent,
    text: `
⚠️ Thông báo: Đặt phòng đã bị hủy

Xin chào ${user_name},

Chúng tôi thông báo rằng đặt phòng của bạn đã bị hủy với thông tin như sau:

Thông tin đặt phòng đã hủy:
- Mã đặt phòng: #${booking_id}
- Khách sạn: ${hotel_name}
- Phòng: ${room_name}
- Ngày nhận phòng: ${checkInFormatted}
- Ngày trả phòng: ${checkOutFormatted}
- Số đêm: ${nights} đêm
- Tổng tiền: ${priceFormatted} VNĐ
- Người hủy: ${cancelledByText}
${cancellation_reason ? `- Lý do hủy: ${cancellation_reason}` : ''}

${cancelled_by === 'admin' 
  ? 'Nếu bạn có bất kỳ thắc mắc nào về việc hủy đặt phòng này, vui lòng liên hệ với chúng tôi để được hỗ trợ.'
  : 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chúng tôi hy vọng được phục vụ bạn trong tương lai.'
}

Trân trọng,
Đội ngũ hỗ trợ khách hàng
    `,
  });
}
