import mongoose, { Schema } from "mongoose";

export interface BookingDoc {
  _id: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: "confirmed" | "cancelled";
  createdAt: Date;
}

const bookingSchema = new Schema<BookingDoc>({
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  notes: { type: String },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index(
  { date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

export default mongoose.models.Booking || mongoose.model<BookingDoc>("Booking", bookingSchema);