"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { useI18n } from "./useI18n";

const WEEKDAY_LABELS: Record<string, string[]> = {
  fr: ["L", "M", "M", "J", "V", "S", "D"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function Calendar({
  selected,
  onSelect,
  maxMonthsAhead = 2,
}: {
  selected: string | null;
  onSelect: (dateStr: string) => void;
  maxMonthsAhead?: number;
}) {
  const { lang } = useI18n();
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const minMonth = startOfMonth(today);
  const maxMonth = new Date(minMonth.getFullYear(), minMonth.getMonth() + maxMonthsAhead, 1);

  const weeks = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const leading = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = Array(leading).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewMonth]);

  const canGoPrev = viewMonth.getTime() > minMonth.getTime();
  const canGoNext = viewMonth.getTime() < maxMonth.getTime();

  const monthLabel = viewMonth.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="c4l-calendar">
      <div className="c4l-calendar-head">
        <button
          type="button"
          className="c4l-calendar-nav"
          disabled={!canGoPrev}
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          aria-label="previous month"
        >
          <ChevronLeftIcon size={16} />
        </button>
        <strong className="c4l-calendar-title">{monthLabel}</strong>
        <button
          type="button"
          className="c4l-calendar-nav"
          disabled={!canGoNext}
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          aria-label="next month"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>
      <div className="c4l-calendar-weekdays">
        {WEEKDAY_LABELS[lang].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="c4l-calendar-grid">
        {weeks.flatMap((row, ri) =>
          row.map((d, di) => {
            if (!d) return <span key={`${ri}-${di}`} className="c4l-calendar-cell empty" />;
            const dateStr = toDateStr(d);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isPast = d.getTime() < today.getTime();
            const isToday = d.getTime() === today.getTime();
            const disabled = isWeekend || isPast;
            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                className={
                  "c4l-calendar-cell" +
                  (disabled ? " disabled" : "") +
                  (isToday ? " today" : "") +
                  (selected === dateStr ? " selected" : "")
                }
                onClick={() => onSelect(dateStr)}
              >
                {d.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
