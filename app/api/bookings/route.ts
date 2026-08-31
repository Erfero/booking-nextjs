import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { SERVICES, isBusinessDay } from "@/lib/services";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  await connectDB();
  const bookings = await Booking.find().sort({ date: 1, time: 1 }).lean();
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceId, date, time, customerName, customerEmail, customerPhone, notes } = body || {};

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ message: "Service invalide." }, { status: 400 });
  }
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

  const existing = await Booking.findOne({ date, time });
  if (existing) {
    return NextResponse.json({ message: "Ce créneau vient d'être réservé, choisis-en un autre." }, { status: 409 });
  }

  const booking = await Booking.create({
    serviceId: service.id,
    serviceName: service.name,
    date,
    time,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone?.trim() || undefined,
    notes: notes?.trim() || undefined,
  });

  return NextResponse.json({ id: booking._id, message: "Réservation confirmée." }, { status: 201 });
}
