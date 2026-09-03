interface ServiceContent {
  name: string;
  description: string;
}

interface ServiceBase {
  id: string;
  durationMinutes: number;
  price: number;
  fr: ServiceContent;
  en: ServiceContent;
}

export interface Service {
  id: string;
  durationMinutes: number;
  price: number;
  name: string;
  description: string;
}

export const SERVICES_BASE: ServiceBase[] = [
  {
    id: "audit-seo",
    durationMinutes: 60,
    price: 90,
    fr: {
      name: "Audit SEO complet",
      description: "Analyse technique, contenu et netlinking, avec plan d'action priorisé.",
    },
    en: {
      name: "Full SEO audit",
      description: "Technical, content and backlink analysis, with a prioritized action plan.",
    },
  },
  {
    id: "conseil-strategie",
    durationMinutes: 30,
    price: 45,
    fr: {
      name: "Consultation stratégie web",
      description: "Point rapide sur ton projet : stack technique, priorités, prochaines étapes.",
    },
    en: {
      name: "Web strategy consultation",
      description: "Quick check-in on your project: tech stack, priorities, next steps.",
    },
  },
  {
    id: "revue-code",
    durationMinutes: 45,
    price: 60,
    fr: {
      name: "Revue de code",
      description: "Analyse de ton code (React, Vue, Laravel…) avec retours concrets et priorisés.",
    },
    en: {
      name: "Code review",
      description: "Review of your code (React, Vue, Laravel…) with concrete, prioritized feedback.",
    },
  },
];

export function getServices(lang: "fr" | "en"): Service[] {
  return SERVICES_BASE.map(({ id, durationMinutes, price, fr, en }) => ({
    id,
    durationMinutes,
    price,
    ...(lang === "en" ? en : fr),
  }));
}

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
