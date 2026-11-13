import { isAdminRequest, resolvedAdminPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return Response.json({
    ok: isAdminRequest(request.headers.get("cookie")),
    configured: Boolean(resolvedAdminPassword()),
  });
}
