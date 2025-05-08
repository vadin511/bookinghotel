import { totp } from 'otplib';

totp.options = { step: 300 };
export function generateOTP(secret: string) {
  return totp.generate(secret);
}

export function verifyOTP(token: string, secret: string) {
  return totp.check(token, secret);
}