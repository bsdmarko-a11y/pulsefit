import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "pulsefit_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    const err = new Error("JWT_SECRET is not set");
    err.statusCode = 500;
    err.userMessage = "The server is missing its JWT_SECRET. Check your .env file.";
    throw err;
  }
  return new TextEncoder().encode(s);
}

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash);

export async function signToken(userId) {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** Read the auth cookie on both Vercel (req.cookies) and raw Node headers. */
function readCookie(req) {
  if (req.cookies?.[COOKIE]) return req.cookies[COOKIE];

  const header = req.headers?.cookie;
  if (!header) return null;

  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    if (part.slice(0, i).trim() === COOKIE) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return null;
}

/** Returns the user id, or null when there is no valid session. */
export async function getUserId(req) {
  const token = readCookie(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.uid === "number" ? payload.uid : null;
  } catch {
    return null;
  }
}

/** Throws a 401 when there is no session. Use at the top of protected routes. */
export async function requireUserId(req) {
  const uid = await getUserId(req);
  if (!uid) {
    const err = new Error("Not authenticated");
    err.statusCode = 401;
    err.userMessage = "Please sign in to continue.";
    throw err;
  }
  return uid;
}

export function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
  );
}

export function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`
  );
}
