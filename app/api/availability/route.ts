import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { generateDaySlots, isBusinessDay } from "@/lib/services";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "Paramètre 'date' invalide (attendu YYYY-MM-DD)." }, { status: 400 });
  }

  if (!isBusinessDay(date)) {
    return NextResponse.json({ slots: [] });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (date < todayStr) {
    return NextResponse.json({ slots: [] });
  }

  await connectDB();
  const taken = await Booking.find({ date, status: { $ne: "cancelled" } })
    .select("time -_id")
    .lean();
  const takenTimes = new Set(taken.map((b) => b.time));

  const allSlots = generateDaySlots();
  const now = new Date();
  const isToday = date === todayStr;

  const slots = allSlots.filter((time) => {
    if (takenTimes.has(time)) return false;
    if (isToday) {
      const [h, m] = time.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (slotDate.getTime() < now.getTime()) return false;
    }
    return true;
  });

  return NextResponse.json({ slots });
}
