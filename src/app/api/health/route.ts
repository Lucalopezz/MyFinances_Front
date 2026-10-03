import { getServerBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${getServerBackendUrl()}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    return new Response(null, { status: response.ok ? 204 : 503 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
