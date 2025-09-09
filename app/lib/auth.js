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
    return decoded;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}
