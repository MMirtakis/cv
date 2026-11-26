import { Stat } from "@/components/Stat";
import { asDateString, centsToEuro } from "@/lib/format";
import { getOverviewKpis, getTransactions } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const { totals } = await getOverviewKpis();
  const transactions = await getTransactions();

  return (
    <>
      <section className="hero">
        <h1>Οικονομικά κινήσεων</h1>
        <p>Όλα τα έσοδα και έξοδα σε όλες τις εταιρείες, με φίλτρο ανά καταχώρηση.</p>
        <p style={{ marginTop: "0.75rem" }}>
          <Link href="/katayorisi" className="primary-btn" style={{ display: "inline-block" }}>
            Νέα καταχώρηση
          </Link>
        </p>
      </section>

      <div className="grid-stats">
        <Stat label="Έσοδα" cents={totals.income_cents} tone="good" />
        <Stat label="Έξοδα" cents={totals.expense_cents} tone="bad" />
        <Stat
          label="Καθαρά"
          cents={totals.net_cents}
          tone={totals.net_cents >= 0 ? "good" : "bad"}
        />
        <div className="stat tone-neutral">
          <p className="stat-label">Κινήσεις</p>
          <p className="stat-value">{transactions.length}</p>
          <p className="stat-hint">εγγραφές στο δείγμα</p>
        </div>
      </div>

      <section className="section">
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Ημ/νία</th>
                <th>Εταιρεία</th>
                <th>Τύπος</th>
                <th>Κατηγορία</th>
                <th>Περιγραφή</th>
                <th>Ποσό</th>
                <th>Από</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{asDateString(t.entry_date)}</td>
                  <td>
                    <span className="chip">
                      <span className="dot" style={{ background: t.company_color }} />
                      {t.company_name}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${t.kind}`}>
                      {t.kind === "income" ? "Έσοδο" : "Έξοδο"}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.description || "—"}</td>
                  <td>{centsToEuro(Number(t.amount_cents))}</td>
                  <td>{t.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
