export const euro = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
});

export const dateEl = new Intl.DateTimeFormat("el-GR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function centsToEuro(cents: number): string {
  return euro.format(cents / 100);
}

export function parseEuroToCents(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".").replace(/€/g, "");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export const CATEGORIES = {
  income: [
    "Δίδακτρα",
    "Υπηρεσίες",
    "Πωλήσεις",
    "Επιδοτήσεις",
    "Λοιπά έσοδα",
  ],
  expense: [
    "Μισθοδοσία",
    "Ενοίκιο",
    "Λογαριασμοί",
    "Προμήθειες",
    "Marketing",
    "Φόροι/Εισφορές",
    "Λοιπά έξοδα",
  ],
} as const;

export const OBLIGATION_LABELS: Record<string, string> = {
  payroll: "Μισθοδοσία",
  efka: "ΕΦΚΑ",
  aade: "Εφορία / ΑΑΔΕ",
  vat: "ΦΠΑ",
  other: "Άλλο",
};

export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** Normalize PG/PGlite date values for safe React rendering. */
export function asDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return String(value ?? "").slice(0, 10);
}
