import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "604800"; // seconds, default 7 days

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export interface JwtPayload {
  sub: string;
  phone: string;
}

export function signAccessToken(userId: string, phone: string) {
  const payload: JwtPayload = { sub: userId, phone };

  const options: SignOptions = {
    // cast به any برای راضی کردن TypeScript، مقدار در ران‌تایم معتبر است
    expiresIn: Number.isNaN(Number(JWT_EXPIRES_IN))
      ? (JWT_EXPIRES_IN as any)
      : (`${JWT_EXPIRES_IN}s` as any),
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

