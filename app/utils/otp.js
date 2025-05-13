import { totp } from "otplib";

totp.options = { step: 300 };
export function generateOTP(secret) {
  return totp.generate(secret);
}

export function verifyOTP(token, secret) {
  return totp.check(token, secret);
}
