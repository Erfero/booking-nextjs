"use client";

import { StarIcon } from "./icons";
import { useI18n } from "./useI18n";
import Reveal from "./Reveal";

const AVATAR = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&h=160&q=80&fit=crop&auto=format`;

const TESTIMONIALS: Record<"fr" | "en", { name: string; role: string; quote: string; avatar: string }[]> = {
  fr: [
    {
      name: "Camille D.",
      role: "Fondatrice, e-commerce mode",
      quote:
        "L'audit SEO a été d'une clarté rare : priorités claires, gains rapides identifiés. Deux semaines après, le trafic organique était déjà en hausse.",
      avatar: AVATAR("1758518727888-ffa196002e59"),
    },
    {
      name: "Yanis B.",
      role: "CTO, startup SaaS",
      quote:
        "La revue de code a relevé des points qu'on n'aurait jamais vus nous-mêmes. Retours concrets, priorisés, sans jargon inutile.",
      avatar: AVATAR("1651684215020-f7a5b6610f23"),
    },
    {
      name: "Mei T.",
      role: "Product manager",
      quote:
        "Consultation stratégie très efficace en 30 minutes : on est reparti avec un plan d'action net pour les trois prochains mois.",
      avatar: AVATAR("1758691737605-69a0e78bd193"),
    },
  ],
  en: [
    {
      name: "Camille D.",
      role: "Founder, fashion e-commerce",
      quote:
        "The SEO audit was remarkably clear: sharp priorities, quick wins identified. Two weeks later organic traffic was already up.",
      avatar: AVATAR("1758518727888-ffa196002e59"),
    },
    {
      name: "Yanis B.",
      role: "CTO, SaaS startup",
      quote:
        "The code review caught things we'd never have spotted ourselves. Concrete, prioritized feedback, no unnecessary jargon.",
      avatar: AVATAR("1651684215020-f7a5b6610f23"),
    },
    {
      name: "Mei T.",
      role: "Product manager",
      quote:
        "A highly effective 30-minute strategy call — we walked away with a clear action plan for the next three months.",
      avatar: AVATAR("1758691737605-69a0e78bd193"),
    },
  ],
};

export default function Testimonials() {
  const { lang, t } = useI18n();
  const items = TESTIMONIALS[lang];

  return (
    <section className="c4l-testimonials">
      <Reveal>
        <h2 className="c4l-section-title">{t("testimonialsTitle")}</h2>
      </Reveal>
      <div className="c4l-testimonial-grid">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            <div className="c4l-card c4l-testimonial-card">
              <div className="c4l-testimonial-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} size={13} filled />
                ))}
              </div>
              <p className="c4l-testimonial-quote">&ldquo;{item.quote}&rdquo;</p>
              <div className="c4l-testimonial-person">
                <img src={item.avatar} alt={item.name} loading="lazy" />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
