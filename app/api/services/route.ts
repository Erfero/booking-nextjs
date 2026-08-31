import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services";

export async function GET() {
  return NextResponse.json(SERVICES);
}
