import Link from "next/link";
import { Stat } from "@/components/Stat";
import { asDateString, centsToEuro } from "@/lib/format";
import { getOverviewKpis, getObligations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { companies, totals } = await getOverviewKpis();
  const upcoming = (await getObligations()).filter((o) => o.status !== "paid").slice(0, 5);

  return (
    <>
      <section className="hero">
        <h1>Όλες οι επιχειρήσεις σε μία οθόνη</h1>
        <p>
          Έσοδα, έξοδα, επερχόμενες υποχρεώσεις ΕΦΚΑ / εφορίας / μισθοδοσίας και
          καθαρή εικόνα ανά εταιρεία.
        </p>
        <span className="sample-note">Δεδομένα δείγματος για δοκιμή</span>
      </section>

      <div className="grid-stats">
        <Stat label="Συνολικά έσοδα" cents={totals.income_cents} tone="good" />
        <Stat label="Συνολικά έξοδα" cents={totals.expense_cents} tone="bad" />
        <Stat
          label="Καθαρό αποτέλεσμα"
          cents={totals.net_cents}
          tone={totals.net_cents >= 0 ? "good" : "bad"}
        />
        <Stat
          label="Ληξιπρόθεσμα"
          cents={totals.overdue_cents}
          tone={totals.overdue_cents > 0 ? "warn" : "neutral"}
          hint={`${totals.pending_count} ανοιχτές υποχρεώσεις`}
        />
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Ανά εταιρεία</h2>
          <Link href="/katayorisi" className="muted">
            + Γρήγορη καταχώρηση
          </Link>
        </div>
        <div className="company-grid">
          {companies.map((c) => (
            <Link key={c.id} href={`/etaireies/${c.id}`} className="company-card">
              <div className="company-top">
                <span className="swatch" style={{ background: c.color }} />
                <div>
                  <h3>{c.name}</h3>
                  <span>{c.activity}</span>
                </div>
              </div>
              <dl className="mini-kpis">
                <div>
                  <dt>Έσοδα</dt>
                  <dd>{centsToEuro(c.income_cents)}</dd>
                </div>
                <div>
                  <dt>Έξοδα</dt>
                  <dd>{centsToEuro(c.expense_cents)}</dd>
                </div>
                <div>
                  <dt>Καθαρά</dt>
                  <dd>{centsToEuro(c.net_cents)}</dd>
                </div>
                <div>
                  <dt>Υποχρεώσεις</dt>
                  <dd>{c.pending_obligations}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Επόμενες υποχρεώσεις</h2>
          <Link href="/ypoxreoseis" className="muted">
            Όλες
          </Link>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Εταιρεία</th>
                <th>Υποχρέωση</th>
                <th>Προθεσμία</th>
                <th>Ποσό</th>
                <th>Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="chip">
                      <span className="dot" style={{ background: o.company_color }} />
                      {o.company_name}
                    </span>
                  </td>
                  <td>
                    <strong>{o.title}</strong>
                    <div className="muted">{o.period_label}</div>
                  </td>
                  <td>{asDateString(o.due_date)}</td>
                  <td>{centsToEuro(o.amount_cents)}</td>
                  <td>
                    <span className={`badge badge-${o.status}`}>
                      {o.status === "overdue"
                        ? "Ληξιπρόθεσμο"
                        : o.status === "paid"
                          ? "Πληρωμένο"
                          : "Εκκρεμεί"}
                    </span>
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
