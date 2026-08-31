export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
}

export const SERVICES: Service[] = [
  {
    id: "audit-seo",
    name: "Audit SEO complet",
    durationMinutes: 60,
    price: 90,
    description: "Analyse technique, contenu et netlinking, avec plan d'action priorisé.",
  },
  {
    id: "conseil-strategie",
    name: "Consultation stratégie web",
    durationMinutes: 30,
    price: 45,
    description: "Point rapide sur ton projet : stack technique, priorités, prochaines étapes.",
  },
  {
    id: "revue-code",
    name: "Revue de code",
    durationMinutes: 45,
    price: 60,
    description: "Analyse de ton code (React, Vue, Laravel…) avec retours concrets et priorisés.",
  },
];

export const BUSINESS_HOURS = { start: 9, end: 17, slotMinutes: 30 };
export const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri (0=Sun)

export function generateDaySlots(): string[] {
  const slots: string[] = [];
  const totalMinutes = (BUSINESS_HOURS.end - BUSINESS_HOURS.start) * 60;
  for (let m = 0; m < totalMinutes; m += BUSINESS_HOURS.slotMinutes) {
    const hour = BUSINESS_HOURS.start + Math.floor(m / 60);
    const minute = m % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return slots;
}

export function isBusinessDay(dateStr: string): boolean {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return BUSINESS_DAYS.includes(day);
}