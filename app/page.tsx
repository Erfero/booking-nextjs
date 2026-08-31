"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "./useTheme";
import { useI18n } from "./useI18n";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
}

function nextBusinessDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      days.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("fr-FR", { weekday: "short" }),
    day: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
  };
}

export default function Home() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [days] = useState(() => nextBusinessDays(10));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", notes: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const step = useMemo(() => {
    if (confirmed) return 4;
    if (selectedTime) return 3;
    if (selectedService) return 2;
    return 1;
  }, [selectedService, selectedTime, confirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la réservation");
      setConfirmed(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="c4l-shell">
        <Header />
        <main className="c4l-main">
          <div className="c4l-card c4l-confirmation">
            <span className="c4l-badge">{t("confirmedBadge")}</span>
            <h1 style={{ marginTop: 12 }}>{t("confirmedTitle")}</h1>
            <p className="c4l-lead" style={{ margin: "12px auto 0", textAlign: "center" }}>
              {selectedService?.name} — {selectedDate && formatDateLabel(selectedDate).day} à {selectedTime}
              <br />
              {t("reference")} : <code>{confirmed}</code>
            </p>
            <button className="c4l-ghost" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>
              {t("bookAnother")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="c4l-shell">
      <Header />
      <main className="c4l-main">
        <section className="c4l-intro">
          <span className="c4l-badge">{t("badge")}</span>
          <h1>{t("heroTitle")}</h1>
          <p className="c4l-lead">{t("heroLead")}</p>
        </section>

        <div className="c4l-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={"c4l-step" + (step >= s ? " done" : "")} />
          ))}
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 4 }}>{t("step1")}</h2>
        <div className="c4l-service-grid">
          {services.map((s) => (
            <button
              key={s.id}
              className={"c4l-card c4l-service-card" + (selectedService?.id === s.id ? " selected" : "")}
              onClick={() => {
                setSelectedService(s);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              <h3>{s.name}</h3>
              <div className="c4l-service-meta">
                <span>{s.durationMinutes} min</span>
                <span className="c4l-service-price">{s.price} €</span>
              </div>
              <p className="c4l-service-desc">{s.description}</p>
            </button>
          ))}
        </div>

        {selectedService && (
          <>
            <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 4 }}>{t("step2")}</h2>
            <div className="c4l-date-row">
              {days.map((d) => {
                const { weekday, day } = formatDateLabel(d);
                return (
                  <button
                    key={d}
                    className={"c4l-date-pill" + (selectedDate === d ? " selected" : "")}
                    onClick={() => setSelectedDate(d)}
                  >
                    {day}
                    <span>{weekday}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {selectedDate && (
          <>
            <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 4 }}>{t("step3")}</h2>
            {loadingSlots && <p className="c4l-empty">{t("loadingSlots")}</p>}
            {!loadingSlots && slots.length === 0 && (
              <p className="c4l-empty">{t("noSlots")}</p>
            )}
            <div className="c4l-slot-grid">
              {slots.map((t) => (
                <button
                  key={t}
                  className={"c4l-slot" + (selectedTime === t ? " selected" : "")}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedTime && (
          <form className="c4l-card c4l-form" onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 18 }}>{t("step4")}</h2>
            <div className="c4l-summary">
              <strong>{selectedService?.name}</strong> — {selectedDate && formatDateLabel(selectedDate).day} à{" "}
              {selectedTime} ({selectedService?.durationMinutes} min, {selectedService?.price} €)
            </div>
            <label>
              {t("fullName")}
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </label>
            <label>
              {t("email")}
              <input
                required
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              />
            </label>
            <label>
              {t("phone")}
              <input
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              />
            </label>
            <label>
              {t("message")}
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            {error && <p className="c4l-error">{error}</p>}
            <button className="c4l-primary" type="submit" disabled={submitting}>
              {submitting ? t("confirming") : t("confirmBtn")}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  return (
    <header className="c4l-header">
      <a href="/" className="c4l-logo">
        <svg width="28" height="28" viewBox="0 0 40 40">
          <rect width="40" height="40" rx="11" fill="#14b8a6" />
          <path d="M14 12 L7 20 L14 28" stroke="#06120f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M26 12 L33 20 L26 28" stroke="#06120f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {t("brand")}
      </a>
      <div className="c4l-header-actions" style={{ display: "flex", gap: 8 }}>
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

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="c4l-footer">
      {t("footerBuilt")} —{" "}
      <a href="https://code4life-2.vercel.app" target="_blank" rel="noopener noreferrer">
        {t("footerBack")}
      </a>
    </footer>
  );
}
