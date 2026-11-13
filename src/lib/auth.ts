import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "aurelia_admin";

export function resolvedAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return "aurelia";
  return null;
}

export function adminToken(password: string) {
  return createHmac("sha256", password).update("aurelia-admin-session-v1").digest("hex");
}

function readCookie(header: string | null, name: string) {
  if (!header) return null;
  const parts = header.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

export function isAdminRequest(cookieHeader: string | null) {
  const password = resolvedAdminPassword();
  if (!password) return false;
  const token = readCookie(cookieHeader, ADMIN_COOKIE);
  if (!token) return false;
  const expected = adminToken(password);
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
