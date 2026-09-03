import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function POST(req: NextRequest) {
  const { id, email } = (await req.json()) || {};
  if (!id || !email) {
    return NextResponse.json({ message: "Numéro de réservation et email requis." }, { status: 400 });
  }
  try {
    await connectDB();
    const booking = await Booking.findById(id).lean();
    if (!booking || booking.customerEmail.toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json({ message: "Aucune réservation trouvée avec ces informations." }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ message: "Aucune réservation trouvée avec ces informations." }, { status: 404 });
  }
}
