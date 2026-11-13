import { isAdminRequest } from "@/lib/auth";
import { isApartmentStatus } from "@/data/building";
import { updateApartment } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request.headers.get("cookie"))) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { price?: number; status?: string };
  const status = typeof body.status === "string" && isApartmentStatus(body.status) ? body.status : undefined;
  const price = typeof body.price === "number" ? body.price : Number(body.price);
  const apartment = await updateApartment(id, {
    price: Number.isFinite(price) ? price : undefined,
    status,
  });
  if (!apartment) return Response.json({ ok: false, error: "Residence not found." }, { status: 404 });
  return Response.json({ ok: true, apartment });
}
