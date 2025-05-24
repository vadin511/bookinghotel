// lib/auth.ts
import jwt from "jsonwebtoken";
import { UserPayload } from "@/type/user"; // 👈 import interface

const jwtKey = process.env.JWT_SECRET!;

export function getUserFromToken(req: any): UserPayload | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtKey) as UserPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
