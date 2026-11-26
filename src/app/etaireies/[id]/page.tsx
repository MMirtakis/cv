import Link from "next/link";
import { notFound } from "next/navigation";
import { Stat } from "@/components/Stat";
import { MarkPaidButton } from "@/components/MarkPaidButton";
import { OBLIGATION_LABELS, asDateString, centsToEuro } from "@/lib/format";
import {
  getCompany,
  getEmployees,
  getObligations,
  getTransactions,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const transactions = await getTransactions(id);
  const obligations = await getObligations(id);
  const employees = await getEmployees(id);

  const income = transactions
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + Number(t.amount_cents), 0);
  const expense = transactions
    .filter((t) => t.kind === "expense")
    .reduce((s, t) => s + Number(t.amount_cents), 0);

  return (
    <>
      <section className="hero">
        <p className="muted" style={{ marginBottom: "0.4rem" }}>
          <Link href="/">← Όλες οι εταιρείες</Link>
        </p>
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <span className="swatch" style={{ background: company.color, height: "2.4rem" }} />
          {company.name}
        </h1>
        <p>
          ΑΦΜ {company.afm} · {company.activity}
        </p>
      </section>

      <div className="grid-stats">
        <Stat label="Έσοδα" cents={income} tone="good" />
        <Stat label="Έξοδα" cents={expense} tone="bad" />
        <Stat
          label="Καθαρά"
          cents={income - expense}
          tone={income - expense >= 0 ? "good" : "bad"}
        />
        <div className="stat tone-neutral">
          <p className="stat-label">Προσωπικό</p>
          <p className="stat-value">{employees.length}</p>
          <p className="stat-hint">ενεργοί</p>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Κινήσεις</h2>
          <Link href="/katayorisi" className="muted">
            + Καταχώρηση
          </Link>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Ημ/νία</th>
                <th>Τύπος</th>
                <th>Κατηγορία</th>
                <th>Περιγραφή</th>
                <th>Ποσό</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{asDateString(t.entry_date)}</td>
                  <td>
                    <span className={`badge badge-${t.kind}`}>
                      {t.kind === "income" ? "Έσοδο" : "Έξοδο"}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.description || "—"}</td>
                  <td>{centsToEuro(Number(t.amount_cents))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Υποχρεώσεις</h2>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Είδος</th>
                <th>Τίτλος</th>
                <th>Προθεσμία</th>
                <th>Ποσό</th>
                <th>Κατάσταση</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((o) => (
                <tr key={o.id}>
                  <td>{OBLIGATION_LABELS[o.kind]}</td>
                  <td>{o.title}</td>
                  <td>{asDateString(o.due_date)}</td>
                  <td>{centsToEuro(Number(o.amount_cents))}</td>
                  <td>
                    <span className={`badge badge-${o.status}`}>
                      {o.status === "overdue"
                        ? "Ληξιπρόθεσμο"
                        : o.status === "paid"
                          ? "Πληρωμένο"
                          : "Εκκρεμεί"}
                    </span>
                  </td>
                  <td>
                    <MarkPaidButton id={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
