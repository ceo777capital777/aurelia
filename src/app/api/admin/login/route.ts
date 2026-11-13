import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, resolvedAdminPassword } from "@/lib/auth";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function matches(input: string, password: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(password);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const password = resolvedAdminPassword();
  if (!password) {
    return NextResponse.json({ ok: false, error: "Admin password is not configured." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !matches(body.password, password)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
