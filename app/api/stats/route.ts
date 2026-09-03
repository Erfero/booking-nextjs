import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function GET() {
  await connectDB();
  const totalBookings = await Booking.countDocuments({ status: { $ne: "cancelled" } });
  return NextResponse.json({ totalBookings });
}
