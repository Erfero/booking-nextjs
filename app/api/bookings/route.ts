import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { SERVICES_BASE, isBusinessDay } from "@/lib/services";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  await connectDB();

  const date = req.nextUrl.searchParams.get("date");
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const filter: Record<string, unknown> = {};
  if (date) filter.date = date;
  if (q) {
    filter.$or = [
      { customerName: { $regex: q, $options: "i" } },
      { customerEmail: { $regex: q, $options: "i" } },
    ];
  }

  const bookings = await Booking.find(filter).sort({ date: 1, time: 1 }).lean();
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceId, date, time, customerName, customerEmail, customerPhone, notes, lang } = body || {};

  const service = SERVICES_BASE.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ message: "Service invalide." }, { status: 400 });
  }
  const serviceName = lang === "en" ? service.en.name : service.fr.name;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isBusinessDay(date)) {
    return NextResponse.json({ message: "Date invalide ou hors jours ouvrés." }, { status: 400 });
  }
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ message: "Créneau invalide." }, { status: 400 });
  }
  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    return NextResponse.json({ message: "Nom requis." }, { status: 400 });
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ message: "Email invalide." }, { status: 400 });
  }

  await connectDB();

  const existing = await Booking.findOne({ date, time, status: { $ne: "cancelled" } });
  if (existing) {
    return NextResponse.json({ message: "Ce créneau vient d'être réservé, choisis-en un autre." }, { status: 409 });
  }

  let booking;
  try {
    booking = await Booking.create({
      serviceId: service.id,
      serviceName,
      date,
      time,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return NextResponse.json({ message: "Ce créneau vient d'être réservé, choisis-en un autre." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ id: booking._id, message: "Réservation confirmée." }, { status: 201 });
}
