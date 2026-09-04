"use client";

import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { useI18n } from "./useI18n";

interface BookingLike {
  _id: string;
  status: "confirmed" | "cancelled";
  [key: string]: unknown;
}

export default function RescheduleForm({
  bookingId,
  email,
  onDone,
  onCancel,
}: {
  bookingId: string;
  email: string;
  onDone: (booking: BookingLike) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime(null);
    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  const handleConfirm = async () => {
    if (!date || !time) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", email, date, time }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDone(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="c4l-reschedule">
      <h3>{t("rescheduleTitle")}</h3>
      <Calendar selected={date} onSelect={setDate} />
      {date && (
        <div className="c4l-step-panel">
          {loadingSlots && <p className="c4l-empty">{t("loadingSlots")}</p>}
          {!loadingSlots && slots.length === 0 && <p className="c4l-empty">{t("noSlots")}</p>}
          <div className="c4l-slot-grid">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={"c4l-slot" + (time === slot ? " selected" : "")}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="c4l-error">{error}</p>}
      <div className="c4l-reschedule-actions">
        <button type="button" className="c4l-ghost" onClick={onCancel}>
          {t("rescheduleCancel")}
        </button>
        <button type="button" className="c4l-primary" disabled={!time || submitting} onClick={handleConfirm}>
          {submitting ? t("rescheduling") : t("rescheduleConfirm")}
        </button>
      </div>
    </div>
  );
}
