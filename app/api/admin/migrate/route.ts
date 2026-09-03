import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { SERVICES_BASE, generateDaySlots } from "@/lib/services";

const DEMO_CUSTOMERS = [
  { name: "Camille Duval", email: "camille.duval@example.com", phone: "0611223344" },
  { name: "Yanis Belkacem", email: "yanis.belkacem@example.com", phone: "0655667788" },
  { name: "Mei Tanaka", email: "mei.tanaka@example.com" },
  { name: "Thomas Girard", email: "thomas.girard@example.com", phone: "0699887766" },
  { name: "Sofia Martins", email: "sofia.martins@example.com" },
];

function businessDaysAgo(n: number): string {
  const d = new Date();
  let remaining = n;
  while (remaining > 0) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-seed-secret") !== process.env.SEED_SECRET) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  await connectDB();
  await Booking.syncIndexes();

  const existing = await Booking.countDocuments({});
  if (existing > 0) {
    return NextResponse.json({ message: "Index synchronisés. Réservations déjà présentes, seed ignoré.", indexesSynced: true, seeded: 0 });
  }

  const slots = generateDaySlots();
  const daysAgo = [3, 5, 7, 9, 12, 15, 18, 22, 27, 33];
  const docs = daysAgo.map((n, i) => {
    const date = businessDaysAgo(n);
    const service = SERVICES_BASE[i % SERVICES_BASE.length];
    const customer = DEMO_CUSTOMERS[i % DEMO_CUSTOMERS.length];
    return {
      serviceId: service.id,
      serviceName: service.fr.name,
      date,
      time: slots[(i * 3) % slots.length],
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      status: i === 2 ? "cancelled" : "confirmed",
    };
  });

  await Booking.insertMany(docs);

  return NextResponse.json({ indexesSynced: true, seeded: docs.length });
}
