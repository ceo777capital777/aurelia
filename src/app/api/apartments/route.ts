import { listApartments } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const apartments = await listApartments();
  return Response.json({ apartments });
}
