import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "devchart_super_secret_secret_123456";

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: "Admin" | "Lead" | "Member";
  avatar: string;
  workspace: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const sessionCookie = request.cookies.get("devchart_session");
  if (!sessionCookie) return null;

  return verifyToken(sessionCookie.value);
}
