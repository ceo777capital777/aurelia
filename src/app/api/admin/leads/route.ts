import { isAdminRequest } from "@/lib/auth";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequest(request.headers.get("cookie"))) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const leads = await listLeads();
  return Response.json({ leads });
}
