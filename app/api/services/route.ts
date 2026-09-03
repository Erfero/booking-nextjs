import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/lib/services";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "fr";
  return NextResponse.json(getServices(lang));
}
