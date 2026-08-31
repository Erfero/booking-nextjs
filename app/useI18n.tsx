"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "fr" | "en";

const DICT: Record<Lang, Record<string, string>> = {
  fr: {
    brand: "Code4Life Booking",
    badge: "Projet personnel",
    heroTitle: "Réserve un créneau",
    heroLead:
      "Démo de prise de rendez-vous : Next.js (App Router, Route Handlers) + MongoDB. Choisis une prestation, un créneau disponible en temps réel, et confirme — tout est enregistré en base.",
    step1: "1. Choisis une prestation",
    step2: "2. Choisis une date",
    step3: "3. Choisis un horaire",
    step4: "4. Tes coordonnées",
    loadingSlots: "Chargement des créneaux…",
    noSlots: "Aucun créneau disponible ce jour-là.",
    fullName: "Nom complet",
    email: "Email",
    phone: "Téléphone (optionnel)",
    message: "Message (optionnel)",
    confirmBtn: "Confirmer le rendez-vous",
    confirming: "Confirmation…",
    confirmedBadge: "Confirmé",
    confirmedTitle: "Rendez-vous réservé !",
    reference: "Référence",
    bookAnother: "Réserver un autre créneau",
    footerBuilt: "Construit par Erféro Keoula",
    footerBack: "retour au portfolio Code4Life ↗",
    adminAccess: "Accès admin",
    adminKey: "Clé d'accès",
    adminSubmit: "Voir les réservations",
    adminChecking: "Vérification…",
    adminBookings: "Réservations",
    adminEmpty: "Aucune réservation pour l'instant.",
    colDate: "Date",
    colTime: "Heure",
    colService: "Prestation",
    colClient: "Client",
    colContact: "Contact",
    invalidKey: "Clé invalide.",
  },
  en: {
    brand: "Code4Life Booking",
    badge: "Personal project",
    heroTitle: "Book a slot",
    heroLead:
      "Appointment booking demo: Next.js (App Router, Route Handlers) + MongoDB. Pick a service, a real-time available slot, and confirm — everything is saved to the database.",
    step1: "1. Choose a service",
    step2: "2. Choose a date",
    step3: "3. Choose a time",
    step4: "4. Your details",
    loadingSlots: "Loading slots…",
    noSlots: "No slots available that day.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Message (optional)",
    confirmBtn: "Confirm booking",
    confirming: "Confirming…",
    confirmedBadge: "Confirmed",
    confirmedTitle: "Appointment booked!",
    reference: "Reference",
    bookAnother: "Book another slot",
    footerBuilt: "Built by Erféro Keoula",
    footerBack: "back to Code4Life portfolio ↗",
    adminAccess: "Admin access",
    adminKey: "Access key",
    adminSubmit: "View bookings",
    adminChecking: "Checking…",
    adminBookings: "Bookings",
    adminEmpty: "No bookings yet.",
    colDate: "Date",
    colTime: "Time",
    colService: "Service",
    colClient: "Client",
    colContact: "Contact",
    invalidKey: "Invalid key.",
  },
};

interface I18nContextValue {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "fr",
  t: (key) => DICT.fr[key] ?? key,
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "fr" || urlLang === "en") {
      setLang(urlLang);
      return;
    }
    const stored = window.localStorage.getItem("c4l_booking_lang") as Lang | null;
    if (stored === "fr" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("c4l_booking_lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "fr" ? "en" : "fr"));
  const t = (key: string) => DICT[lang][key] ?? key;

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}