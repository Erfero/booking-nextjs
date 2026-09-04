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
  status: "confirmed" | "cancelled";
}

interface Stats {
  confirmedCount: number;
  cancelledCount: number;
  revenue: number;
  bookingsThisWeek: number;
  byService: { id: string; name: string; count: number }[];
}

interface BlockedDate {
  _id: string;
  date: string;
  reason?: string;
}

function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  return (
    <header className="c4l-header">
      <a href="/" className="c4l-logo">{t("brand")}</a>
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

export default function AdminPage() {
  const { t } = useI18n();
  const [key, setKey] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ date: "", reason: "" });
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const loadStats = async (authKey: string) => {
    const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${authKey}` } });
    if (res.ok) setStats(await res.json());
  };

  const loadBlockedDates = async () => {
    const res = await fetch("/api/blocked-dates");
    if (res.ok) setBlockedDates(await res.json());
  };

  const load = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (dateFilter) params.set("date", dateFilter);
      const res = await fetch(`/api/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(t("invalidKey"));
      setBookings(await res.json());
      loadStats(key);
      loadBlockedDates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setBookings(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev?.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)) ?? null);
      loadStats(key);
    } catch {
      // ignore, list stays as-is
    } finally {
      setCancellingId(null);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.date) return;
    setBlockSubmitting(true);
    try {
      const res = await fetch("/api/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(blockForm),
      });
      if (res.ok) {
        setBlockForm({ date: "", reason: "" });
        loadBlockedDates();
      }
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleRemoveBlockedDate = async (id: string) => {
    await fetch(`/api/blocked-dates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } });
    setBlockedDates((prev) => prev.filter((d) => d._id !== id));
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
      <main className="c4l-main" style={{ maxWidth: 1100 }}>
        <h1>{t("adminBookings")} ({bookings.length})</h1>

        {stats && (
          <div className="c4l-stats-grid">
            <div className="c4l-card c4l-stat-card">
              <span>{t("statsRevenue")}</span>
              <strong>{stats.revenue} €</strong>
            </div>
            <div className="c4l-card c4l-stat-card">
              <span>{t("statsConfirmed")}</span>
              <strong>{stats.confirmedCount}</strong>
            </div>
            <div className="c4l-card c4l-stat-card">
              <span>{t("statsCancelled")}</span>
              <strong>{stats.cancelledCount}</strong>
            </div>
            <div className="c4l-card c4l-stat-card">
              <span>{t("statsThisWeek")}</span>
              <strong>{stats.bookingsThisWeek}</strong>
            </div>
            <div className="c4l-card c4l-stat-card wide">
              <span>{t("statsByService")}</span>
              <div className="c4l-stat-breakdown">
                {stats.byService.map((s) => (
                  <div key={s.id}>
                    <span>{s.name}</span>
                    <strong>{s.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="c4l-card c4l-blocked-dates">
          <h2>{t("blockedDatesTitle")}</h2>
          <p className="c4l-muted">{t("blockedDatesLead")}</p>
          <form className="c4l-blocked-form" onSubmit={handleAddBlockedDate}>
            <label>
              {t("blockedDateLabel")}
              <input
                type="date"
                required
                value={blockForm.date}
                onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
              />
            </label>
            <label>
              {t("blockedReasonLabel")}
              <input
                type="text"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
              />
            </label>
            <button className="c4l-ghost" type="submit" disabled={blockSubmitting}>
              {t("blockedDatesAdd")}
            </button>
          </form>
          {blockedDates.length === 0 ? (
            <p className="c4l-empty">{t("blockedDatesEmpty")}</p>
          ) : (
            <ul className="c4l-blocked-list">
              {blockedDates.map((d) => (
                <li key={d._id}>
                  <span>
                    {d.date}
                    {d.reason ? ` — ${d.reason}` : ""}
                  </span>
                  <button type="button" className="c4l-ghost" onClick={() => handleRemoveBlockedDate(d._id)}>
                    {t("blockedDatesRemove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form className="c4l-admin-filters" onSubmit={load}>
          <input placeholder={t("adminSearchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} />
          <input type="date" title={t("adminFilterDate")} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <button type="submit" className="c4l-ghost">
            {t("adminSubmit")}
          </button>
          {(q || dateFilter) && (
            <button
              type="button"
              className="c4l-ghost"
              onClick={() => {
                setQ("");
                setDateFilter("");
                load();
              }}
            >
              {t("adminClearFilter")}
            </button>
          )}
        </form>

        {bookings.length === 0 && <p className="c4l-empty">{t("adminNoResults")}</p>}
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
                  <th>{t("colStatus")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className={b.status === "cancelled" ? "cancelled" : ""}>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.serviceName}</td>
                    <td>{b.customerName}</td>
                    <td>
                      {b.customerEmail}
                      {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                    </td>
                    <td>
                      <span className={"c4l-status-badge " + b.status}>
                        {b.status === "confirmed" ? t("statusConfirmed") : t("statusCancelled")}
                      </span>
                    </td>
                    <td>
                      {b.status === "confirmed" && (
                        <button
                          type="button"
                          className="c4l-ghost c4l-admin-cancel"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancel(b._id)}
                        >
                          {cancellingId === b._id ? t("adminCancelling") : t("adminCancelBtn")}
                        </button>
                      )}
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
