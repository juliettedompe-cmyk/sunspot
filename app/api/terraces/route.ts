import { NextRequest, NextResponse } from "next/server";
import { getSunnyTerraces } from "@/application/getSunnyTerraces";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("datetime");
  const date = raw ? new Date(raw) : new Date();

  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: "Invalid datetime. Expected ISO 8601 format." },
      { status: 400 }
    );
  }

  try {
    const terraces = await getSunnyTerraces(date);
    return NextResponse.json(terraces);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/terraces]", message);
    return NextResponse.json({ error: "Failed to fetch terraces." }, { status: 500 });
  }
}
