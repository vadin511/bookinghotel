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
