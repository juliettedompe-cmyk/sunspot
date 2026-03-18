import { NextRequest, NextResponse } from "next/server";
import { getEnrichedTerraces } from "@/services/terraceService";

/**
 * GET /api/terraces?datetime=<ISO8601>
 *
 * Returns all active terraces enriched with solar exposure data.
 * If `datetime` is omitted, uses the current server time.
 */
export async function listTerraces(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("datetime");
  const date = raw ? new Date(raw) : new Date();

  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: "Invalid datetime. Expected ISO 8601 format." },
      { status: 400 }
    );
  }

  try {
    const terraces = await getEnrichedTerraces(date);
    return NextResponse.json(terraces);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[terraceController.listTerraces]", message);
    return NextResponse.json({ error: "Failed to fetch terraces." }, { status: 500 });
  }
}
