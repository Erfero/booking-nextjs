import mongoose, { Schema } from "mongoose";

export interface BlockedDateDoc {
  _id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
  createdAt: Date;
}

const blockedDateSchema = new Schema<BlockedDateDoc>({
  date: { type: String, required: true, unique: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BlockedDate || mongoose.model<BlockedDateDoc>("BlockedDate", blockedDateSchema);
