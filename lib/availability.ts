import { connectDB } from "./db";
import Booking from "./models/Booking";
import BlockedDate from "./models/BlockedDate";
import { isBusinessDay, generateDaySlots } from "./services";

export async function checkSlotBookable(
  date: string,
  time: string,
  excludeBookingId?: string
): Promise<string | null> {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isBusinessDay(date)) {
    return "Date invalide ou hors jours ouvrés.";
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  if (date < todayStr) {
    return "Cette date est passée.";
  }
  if (!time || !generateDaySlots().includes(time)) {
    return "Créneau invalide.";
  }

  await connectDB();

  const blocked = await BlockedDate.findOne({ date }).lean();
  if (blocked) {
    return "Cette date n'est pas disponible.";
  }

  const query: Record<string, unknown> = { date, time, status: { $ne: "cancelled" } };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const existing = await Booking.findOne(query);
  if (existing) {
    return "Ce créneau vient d'être réservé, choisis-en un autre.";
  }

  return null;
}
