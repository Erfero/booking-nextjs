import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { checkSlotBookable } from "@/lib/availability";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) || {};

  const auth = req.headers.get("authorization");
  const adminKey = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const isAdmin = Boolean(adminKey) && adminKey === process.env.ADMIN_KEY;

  try {
    await connectDB();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: "Réservation introuvable." }, { status: 404 });
    }
    if (!isAdmin) {
      const email = typeof body.email === "string" ? body.email.toLowerCase() : "";
      if (!email || email !== booking.customerEmail.toLowerCase()) {
        return NextResponse.json({ message: "Réservation introuvable." }, { status: 404 });
      }
    }
    if (booking.status === "cancelled") {
      return NextResponse.json({ message: "Cette réservation est déjà annulée." }, { status: 409 });
    }
    const startsAt = new Date(`${booking.date}T${booking.time}:00`);
    if (!isAdmin && startsAt.getTime() < Date.now()) {
      return NextResponse.json({ message: "Ce rendez-vous est déjà passé." }, { status: 409 });
    }

    if (body.action === "reschedule") {
      const { date, time } = body;
      const slotError = await checkSlotBookable(date, time, String(booking._id));
      if (slotError) {
        return NextResponse.json({ message: slotError }, { status: 409 });
      }
      booking.date = date;
      booking.time = time;
      await booking.save();
      return NextResponse.json(booking);
    }

    booking.status = "cancelled";
    await booking.save();
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ message: "Réservation introuvable." }, { status: 404 });
  }
}
