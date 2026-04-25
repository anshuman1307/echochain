import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country") || "Unknown";
  const city = req.headers.get("x-vercel-ip-city") || "Unknown";

  return NextResponse.json({ country, city });
}
