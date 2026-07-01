// Commercial vocabulary used by all CIE modules.
// Centralised here so modules and future agents share the same signals.

import type { BusinessLine } from "./types";

// ─── Business line term matching ──────────────────────────────────────────────

export const LINE_TERMS: Record<BusinessLine, string[]> = {
  yacht_sale: [
    "yacht", "superyacht", "motor yacht", "sailing yacht", "family office",
    "acquisition", "broker", "asset manager", "wealth", "off-market",
    "seller", "sale", "buyer", "purchase", "invest"
  ],
  yacht_charter: [
    "yacht charter", "charter", "concierge", "travel advisor",
    "itinerary", "mediterranean", "summer", "broker", "family office",
    "bareboat", "crewed", "sailing trip", "private yacht"
  ],
  car_rental: [
    "car rental", "chauffeur", "vip transfer", "airport transfer",
    "minibus", "renault trafic", "mercedes v-class", "9-seater", "8-seater",
    "wedding", "event", "rolls", "bentley", "ferrari", "lamborghini",
    "hotel", "villa", "private aviation", "crew transfer", "van"
  ],
  mixed: [
    "luxury", "mobility", "concierge", "family office",
    "vip", "yacht", "charter", "chauffeur", "rental", "transfer"
  ]
};

// ─── Demand signals (positive — buyer/requestor intent) ───────────────────────

export const DEMAND_SIGNALS = [
  "looking for", "need", "needed", "wanted", "seeking", "looking to",
  "in search of", "do you have", "can anyone recommend", "anyone know",
  "recherche", "besoin de", "cherche", "cherchez", "je cherche",
  "cerco", "ho bisogno", "sto cercando",
  "suche", "brauche", "dringend gesucht",
  "busco", "necesito", "buscamos",
  "ищу", "нужен", "нужна", "нужно", "ищем"
];

// ─── Urgency signals (time-critical demand) ───────────────────────────────────

export const URGENCY_SIGNALS = [
  "today", "tonight", "this evening", "right now", "immediately", "asap",
  "urgent", "emergency", "last minute", "last-minute",
  "tomorrow", "this weekend", "next week",
  "aujourd'hui", "ce soir", "maintenant", "urgent", "dès que possible",
  "demain", "ce week-end",
  "oggi", "stasera", "subito", "urgente", "domani",
  "heute", "heute abend", "sofort", "dringend", "morgen",
  "hoy", "esta noche", "ahora mismo", "urgente", "mañana",
  "сегодня", "сейчас", "срочно", "завтра"
];

// ─── Commercial role / intent signals (positive for all modes) ────────────────

export const INTENT_TERMS = [
  "looking for", "need", "request", "enquiry", "inquiry", "client",
  "principal", "family office", "advisor", "concierge",
  "broker", "manager", "vip", "private client",
  "buyer", "investor", "seeking", "interested in"
];

// ─── Generic junk / low-value directory signals ───────────────────────────────

export const JUNK_TERMS = [
  "directory", "yellow pages", "top 10", "best 10", "top 5", "ranking",
  "seo", "wikipedia", "jobs board", "career",
  "press release", "magazine", "comparison site", "compare prices"
];

// ─── Provider / competitor self-promotional signals ───────────────────────────
// Only applied in demand_discovery mode to filter out service providers.
// Must NOT be applied in company_discovery / partner_discovery modes
// because brokers and partners use similar language.

export const PROVIDER_SIGNALS = [
  // English
  "we offer", "our fleet", "rent our", "hire our", "book with us",
  "our vehicles", "our cars", "our yachts", "our chauffeurs",
  "reserve our", "book our", "book now", "reserve now",
  "request a quote", "get a free quote", "starting from €", "from € per day",
  "our chauffeur service", "our transfer service", "our car rental service",
  "we provide", "we specialise in", "we specialize in",
  // French
  "notre flotte", "nos véhicules", "louez notre", "réservez maintenant",
  "louer notre", "nos voitures", "nos yachts", "notre service de transfert",
  "devis gratuit", "réservation en ligne", "réservez en ligne",
  "agence de location", "société de location", "service de chauffeur",
  // Italian
  "la nostra flotta", "i nostri veicoli", "prenota ora", "richiedi un preventivo",
  "noleggio auto", "servizio chauffeur",
  // German
  "unsere flotte", "unsere fahrzeuge", "jetzt buchen", "angebot anfordern",
  // Spanish
  "nuestra flota", "nuestros vehículos", "reserva ahora", "solicitar presupuesto"
];

// ─── Job advertisement signals ────────────────────────────────────────────────
// Applied across all search modes.

export const JOB_AD_SIGNALS = [
  // English
  "hiring", "we are hiring", "now hiring", "job opening", "job offer",
  "chauffeur wanted", "driver wanted", "looking for a driver", "looking for chauffeur",
  "apply now", "send your cv", "send your resume", "full-time", "part-time",
  "salary", "hourly rate", "shift work", "night shift", "working hours",
  "employment", "vacancy", "vacancies", "job description", "requirements",
  "experience required", "driving licence required", "clean driving record",
  // French
  "emploi chauffeur", "offre d'emploi", "conducteur recherché",
  "poste chauffeur", "chauffeur recherché", "nous recrutons", "recrutement",
  "cdi", "cdd", "salaire", "candidature", "postuler", "envoyer cv",
  "cherche chauffeur", "besoin chauffeur", "chauffeur privé recherché",
  "permis de conduire", "expérience requise",
  // Italian
  "autista cercasi", "cerchiamo autista", "offerta di lavoro", "candidati ora",
  // German
  "fahrer gesucht", "chauffeur gesucht", "stellenangebot", "bewerbung",
  // Spanish
  "se busca conductor", "oferta de empleo", "conductor requerido", "solicitar empleo"
];

// ─── Generic directory page signals ──────────────────────────────────────────

export const DIRECTORY_SIGNALS = [
  "top 10", "best 10", "top 5", "best 5", "top 20",
  "les meilleures", "les meilleurs", "meilleurs services",
  "comparison", "compare", "review", "reviews", "rated",
  "tripadvisor", "yelp", "trustpilot", "google maps listing",
  "yellow pages", "annuaire", "directory of", "list of companies",
  "all providers", "all companies in", "businesses in"
];

// ─── Stale / old content signals ─────────────────────────────────────────────

export const STALE_YEAR_PATTERN = /\b(200[0-9]|201[0-9]|2022|2023|2024)\b/;
export const CURRENT_YEAR_PATTERN = /\b(2025|2026|2027)\b/;
