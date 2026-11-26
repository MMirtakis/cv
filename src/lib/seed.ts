import { sql } from "./db";
import { uid } from "./format";

export async function seedDatabase(): Promise<void> {
  const companies = [
    {
      id: "co_praksi",
      name: "Πράξη & Πρόοδος",
      short_name: "Πράξη",
      afm: "999000111",
      activity: "Ιδιωτικό φροντιστήριο",
      color: "#1f4b3a",
    },
    {
      id: "co_mk",
      name: "MK Creation",
      short_name: "MK",
      afm: "999000222",
      activity: "Δημιουργικές υπηρεσίες",
      color: "#8b4513",
    },
    {
      id: "co_esm",
      name: "eSM Web Devs",
      short_name: "eSM",
      afm: "999000333",
      activity: "Ανάπτυξη λογισμικού",
      color: "#1e3a5f",
    },
  ];

  for (const c of companies) {
    await sql(
      `insert into companies (id, name, short_name, afm, activity, color)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do nothing`,
      [c.id, c.name, c.short_name, c.afm, c.activity, c.color],
    );
  }

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const daysFrom = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return iso(d);
  };

  const tx = [
    ["co_praksi", "income", 420000, "Δίδακτρα", "Μηνιαία δίδακτρα Οκτωβρίου", daysAgo(12), "Μιχάλης"],
    ["co_praksi", "income", 185000, "Δίδακτρα", "Νέες εγγραφές", daysAgo(5), "συνεργάτης"],
    ["co_praksi", "expense", 98000, "Ενοίκιο", "Ενοίκιο αίθουσας", daysAgo(8), "συνεργάτης"],
    ["co_praksi", "expense", 245000, "Μισθοδοσία", "Καθαροί μισθοί", daysAgo(3), "Μιχάλης"],
    ["co_mk", "income", 320000, "Υπηρεσίες", "Project branding", daysAgo(15), "συνεργάτης"],
    ["co_mk", "expense", 45000, "Προμήθειες", "Υλικά παραγωγής", daysAgo(7), "συνεργάτης"],
    ["co_mk", "expense", 28000, "Marketing", "Meta ads", daysAgo(2), "συνεργάτης"],
    ["co_esm", "income", 780000, "Υπηρεσίες", "Συντήρηση πελατών", daysAgo(10), "Μιχάλης"],
    ["co_esm", "income", 210000, "Υπηρεσίες", "Νέο website", daysAgo(4), "συνεργάτης"],
    ["co_esm", "expense", 120000, "Μισθοδοσία", "Freelancer πληρωμές", daysAgo(6), "συνεργάτης"],
    ["co_esm", "expense", 35000, "Λογαριασμοί", "Hosting / tools", daysAgo(1), "συνεργάτης"],
  ] as const;

  for (const row of tx) {
    await sql(
      `insert into transactions
        (id, company_id, kind, amount_cents, category, description, entry_date, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [uid("tx"), ...row],
    );
  }

  const obligations = [
    ["co_praksi", "payroll", "Μισθοδοσία Νοεμβρίου", 245000, daysFrom(4), "Νοέ 2025", "pending", "Καθαρά + κρατήσεις"],
    ["co_praksi", "efka", "ΕΦΚΑ εργοδότη", 68000, daysFrom(9), "Νοέ 2025", "pending", ""],
    ["co_praksi", "vat", "ΦΠΑ Γ΄ τριμήνου", 112000, daysAgo(2), "Γ΄ τρίμ. 2025", "overdue", "Υπενθύμιση ΑΑΔΕ"],
    ["co_mk", "aade", "Φόρος εισοδήματος προκαταβολή", 45000, daysFrom(18), "2025", "pending", ""],
    ["co_mk", "efka", "ΕΦΚΑ ελεύθερου επαγγελματία", 24600, daysFrom(6), "Νοέ 2025", "pending", ""],
    ["co_esm", "payroll", "Μισθοδοσία / invoices", 120000, daysFrom(3), "Νοέ 2025", "pending", ""],
    ["co_esm", "vat", "ΦΠΑ μηνιαία δήλωση", 89000, daysFrom(14), "Οκτ 2025", "pending", ""],
    ["co_esm", "aade", "Παρακράτηση φόρου", 31000, daysAgo(1), "Οκτ 2025", "overdue", ""],
  ] as const;

  for (const row of obligations) {
    await sql(
      `insert into obligations
        (id, company_id, kind, title, amount_cents, due_date, period_label, status, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [uid("ob"), ...row],
    );
  }

  const employees = [
    ["co_praksi", "Ελένη Παπαδοπούλου", "Καθηγήτρια Μαθηματικών", 145000],
    ["co_praksi", "Νίκος Γεωργίου", "Καθηγητής Πληροφορικής", 138000],
    ["co_mk", "Άννα Κωνσταντίνου", "Designer", 160000],
    ["co_esm", "Γιώργος Δημητρίου", "Full-stack developer", 210000],
  ] as const;

  for (const row of employees) {
    await sql(
      `insert into employees (id, company_id, full_name, role_title, gross_cents, active)
       values ($1,$2,$3,$4,$5,true)`,
      [uid("em"), ...row],
    );
  }
}
