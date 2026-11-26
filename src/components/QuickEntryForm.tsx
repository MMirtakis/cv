"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CATEGORIES } from "@/lib/format";

type CompanyOption = { id: string; name: string };

export function QuickEntryForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: data.get("companyId"),
        kind,
        amount: data.get("amount"),
        category: data.get("category"),
        description: data.get("description"),
        entryDate: data.get("entryDate"),
        createdBy: data.get("createdBy"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(body.error || "Αποτυχία αποθήκευσης.");
      return;
    }

    setStatus("ok");
    setMessage("Αποθηκεύτηκε.");
    form.reset();
    router.refresh();
  }

  const categories = kind === "income" ? CATEGORIES.income : CATEGORIES.expense;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="entry-form" onSubmit={onSubmit}>
      <div className="kind-toggle" role="group" aria-label="Τύπος">
        <button
          type="button"
          className={kind === "income" ? "is-active income" : "income"}
          onClick={() => setKind("income")}
        >
          Έσοδο
        </button>
        <button
          type="button"
          className={kind === "expense" ? "is-active expense" : "expense"}
          onClick={() => setKind("expense")}
        >
          Έξοδο
        </button>
      </div>

      <label>
        Εταιρεία
        <select name="companyId" required defaultValue={companies[0]?.id}>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ποσό (€)
        <input
          name="amount"
          inputMode="decimal"
          placeholder="π.χ. 250,00"
          required
          autoFocus
        />
      </label>

      <label>
        Κατηγορία
        <select key={kind} name="category" required defaultValue={categories[0]}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ημερομηνία
        <input name="entryDate" type="date" defaultValue={today} required />
      </label>

      <label>
        Περιγραφή (προαιρετικά)
        <input name="description" placeholder="Σύντομη σημείωση" maxLength={200} />
      </label>

      <label>
        Καταχωρήθηκε από
        <input name="createdBy" defaultValue="συνεργάτης" maxLength={60} />
      </label>

      <button type="submit" className="primary-btn" disabled={status === "saving"}>
        {status === "saving" ? "Αποθήκευση…" : "Αποθήκευση καταχώρησης"}
      </button>

      {message ? (
        <p className={status === "error" ? "form-msg error" : "form-msg ok"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
