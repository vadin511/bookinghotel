import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.FROM_EMAIL!,
    pass: process.env.APP_PASSWORD!,
  },
});

export async function sendOTPEmail(to: string, otp: string) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to : 'dev2.astranony@gmail.com',
    subject: 'Mã xác thực OTP',
    text: `Mã OTP của bạn là: ${otp}`,
  });
}