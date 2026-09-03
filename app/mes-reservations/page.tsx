"use client";

import { useState } from "react";
import { useTheme } from "../useTheme";
import { useI18n } from "../useI18n";
import { CheckCircleIcon, XCircleIcon } from "../icons";

interface Booking {
  _id: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  status: "confirmed" | "cancelled";
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  return (
    <header className="c4l-header">
      <a href="/" className="c4l-logo">
        {t("brand")}
      </a>
      <div className="c4l-header-actions">
        <button type="button" className="c4l-icon-btn" onClick={toggleTheme} aria-label="theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <button type="button" className="c4l-icon-btn" onClick={toggleLang} aria-label="lang">
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </header>
  );
}

export default function MyBookingsPage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ id: "", email: "" });
  const [booking, setBooking] = useState<Booking | null>(null);
  const [state, setState] = useState<"idle" | "searching" | "found">("idle");
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("searching");
    setError("");
    setBooking(null);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBooking(data);
      setState("found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setState("idle");
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCancelling(false);
    }
  };

  const dateLabel =
    booking &&
    new Date(`${booking.date}T00:00:00`).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  return (
    <div className="c4l-shell">
      <Header />
      <main className="c4l-main">
        <h1>{t("myBookingsTitle")}</h1>
        <p className="c4l-lead">{t("myBookingsLead")}</p>

        <form className="c4l-card c4l-form c4l-lookup-form" onSubmit={handleSubmit}>
          <label>
            {t("lookupIdLabel")}
            <input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          </label>
          <label>
            {t("lookupEmailLabel")}
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          {error && <p className="c4l-error">{error}</p>}
          <button className="c4l-primary" type="submit" disabled={state === "searching"}>
            {state === "searching" ? t("lookupSearching") : t("lookupSubmit")}
          </button>
        </form>

        {booking && (
          <div className="c4l-card c4l-booking-result">
            <div className="c4l-booking-result-head">
              <div>
                <strong>{booking.serviceName}</strong>
                <p className="c4l-muted">
                  {dateLabel} — {booking.time}
                </p>
              </div>
              <span className={"c4l-status-badge " + booking.status}>
                {booking.status === "confirmed" ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
                {booking.status === "confirmed" ? t("statusConfirmed") : t("statusCancelled")}
              </span>
            </div>
            {booking.status === "confirmed" ? (
              <button type="button" className="c4l-ghost c4l-cancel-btn" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? t("cancelling") : t("cancelBtn")}
              </button>
            ) : (
              <p className="c4l-empty">{t("cancelledNotice")}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
