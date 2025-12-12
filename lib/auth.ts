import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * ✅ Supports:
 *  - Authorization: Bearer <token>
 *  - Cookie: token=<token>
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  // 1️⃣ Authorization header (optional)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2️⃣ Cookie fallback (THIS WAS MISSING)
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader
    .split("; ")
    .find(c => c.startsWith("token="))
    ?.split("=")[1];

  return token || null;
}

export async function authMiddleware(req: NextRequest) {
  const token = getTokenFromRequest(req);

  console.log("🔐 Auth Middleware Headers:", req.headers);
  console.log("🔑 Token found:", token);

  if (!token) {
    return { authenticated: false, user: null, error: "No token provided" };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { authenticated: false, user: null, error: "Invalid token" };
  }

  return { authenticated: true, user: payload, error: null };
}
