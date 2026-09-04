import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { SERVICES_BASE } from "@/lib/services";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  await connectDB();

  const confirmed = await Booking.find({ status: "confirmed" }).select("serviceId date").lean();
  const cancelledCount = await Booking.countDocuments({ status: "cancelled" });

  const priceById = new Map(SERVICES_BASE.map((s) => [s.id, s.price]));
  const revenue = confirmed.reduce((sum, b) => sum + (priceById.get(b.serviceId) ?? 0), 0);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const bookingsThisWeek = confirmed.filter((b) => b.date >= weekStartStr).length;

  const byService = SERVICES_BASE.map((s) => ({
    id: s.id,
    name: s.fr.name,
    count: confirmed.filter((b) => b.serviceId === s.id).length,
  }));

  return NextResponse.json({
    confirmedCount: confirmed.length,
    cancelledCount,
    revenue,
    bookingsThisWeek,
    byService,
  });
}
