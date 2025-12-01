// lib/auth.ts
import jwt from "jsonwebtoken";
const jwtKey = process.env.JWT_SECRET;
if (!jwtKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export function getUserFromToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    /** @type {UserPayload} */
    const decoded = jwt.verify(token, jwtKey);
    
    // Kiểm tra type phải là access token
    if (decoded.type && decoded.type !== "access") {
      return null;
    }
    
    return decoded;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // Token hết hạn hoặc không hợp lệ
    return null;
  }
}

export function getRefreshToken(req) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const decoded = jwt.verify(refreshToken, jwtKey);
    
    // Kiểm tra type phải là refresh token
    if (decoded.type !== "refresh") {
      return null;
    }
    
    return decoded;
  } catch (err) {
    return null;
  }
}
