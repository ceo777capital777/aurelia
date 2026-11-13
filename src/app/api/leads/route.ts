import { createLead, rateLimit } from "@/lib/store";
import { notifyTelegram } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return Response.json({ ok: false, error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.company, 80)) {
    return Response.json({ ok: true, id: "received" });
  }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 32);
  const email = clean(body.email, 120);
  const message = clean(body.message, 1000);
  if (name.length < 2) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (phone.length < 6) return Response.json({ ok: false, error: "Please enter a phone number." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  const lead = await createLead({
    name,
    phone,
    email,
    message,
    apartmentId: clean(body.apartmentId, 40),
    apartmentNumber: clean(body.apartmentNumber, 40),
    floor: Number(body.floor) || 0,
    area: Number(body.area) || 0,
    price: Number(body.price) || 0,
    status: clean(body.status, 20),
  });

  await notifyTelegram(lead);
  return Response.json({ ok: true, id: lead.id });
}
