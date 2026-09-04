import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlockedDate from "@/lib/models/BlockedDate";

function isAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return Boolean(key) && key === process.env.ADMIN_KEY;
}

export async function GET() {
  await connectDB();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dates = await BlockedDate.find({ date: { $gte: todayStr } })
    .sort({ date: 1 })
    .lean();
  return NextResponse.json(dates);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  const { date, reason } = (await req.json()) || {};
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "Date invalide." }, { status: 400 });
  }
  await connectDB();
  try {
    const blocked = await BlockedDate.create({ date, reason: reason?.trim() || undefined });
    return NextResponse.json(blocked, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return NextResponse.json({ message: "Cette date est déjà bloquée." }, { status: 409 });
    }
    throw err;
  }
}
