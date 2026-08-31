"use client";

import { useState } from "react";
import { useTheme } from "../useTheme";
import { useI18n } from "../useI18n";

interface Booking {
  _id: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  return (
    <header className="c4l-header">
      <a href="/" className="c4l-logo">{t("brand")}</a>
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

export default function AdminPage() {
  const { t } = useI18n();
  const [key, setKey] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error(t("invalidKey"));
      setBookings(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setBookings(null);
    } finally {
      setLoading(false);
    }
  };

  if (!bookings) {
    return (
      <div className="c4l-shell">
        <AdminHeader />
        <main className="c4l-main">
          <h1>{t("adminAccess")}</h1>
          <form className="c4l-card c4l-form" onSubmit={load} style={{ maxWidth: 360 }}>
            <label>
              {t("adminKey")}
              <input type="password" value={key} onChange={(e) => setKey(e.target.value)} />
            </label>
            {error && <p className="c4l-error">{error}</p>}
            <button className="c4l-primary" type="submit" disabled={loading}>
              {loading ? t("adminChecking") : t("adminSubmit")}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="c4l-shell">
      <AdminHeader />
      <main className="c4l-main" style={{ maxWidth: 1000 }}>
        <h1>{t("adminBookings")} ({bookings.length})</h1>
        {bookings.length === 0 && <p className="c4l-empty">{t("adminEmpty")}</p>}
        {bookings.length > 0 && (
          <div className="c4l-table-wrap">
            <table className="c4l-admin-table">
              <thead>
                <tr>
                  <th>{t("colDate")}</th>
                  <th>{t("colTime")}</th>
                  <th>{t("colService")}</th>
                  <th>{t("colClient")}</th>
                  <th>{t("colContact")}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.serviceName}</td>
                    <td>{b.customerName}</td>
                    <td>
                      {b.customerEmail}
                      {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
