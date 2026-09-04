import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlockedDate from "@/lib/models/BlockedDate";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  const { id } = await params;
  await connectDB();
  await BlockedDate.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
