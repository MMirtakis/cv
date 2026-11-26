import { MarkPaidButton } from "@/components/MarkPaidButton";
import { Stat } from "@/components/Stat";
import { OBLIGATION_LABELS, asDateString, centsToEuro } from "@/lib/format";
import { getEmployees, getObligations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ObligationsPage() {
  const obligations = await getObligations();
  const employees = await getEmployees();

  const overdue = obligations
    .filter((o) => o.status === "overdue")
    .reduce((s, o) => s + Number(o.amount_cents), 0);
  const pending = obligations
    .filter((o) => o.status === "pending")
    .reduce((s, o) => s + Number(o.amount_cents), 0);
  const payroll = obligations
    .filter((o) => o.kind === "payroll" && o.status !== "paid")
    .reduce((s, o) => s + Number(o.amount_cents), 0);
  const efka = obligations
    .filter((o) => o.kind === "efka" && o.status !== "paid")
    .reduce((s, o) => s + Number(o.amount_cents), 0);

  return (
    <>
      <section className="hero">
        <h1>Μισθοδοσία, ΕΦΚΑ, εφορία</h1>
        <p>
          Παρακολούθηση προθεσμιών και ποσών ανά εταιρεία — χωρίς να αντικαθιστά
          λογιστή/ERP, αλλά με καθαρή εικόνα τι πρέπει να πληρωθεί.
        </p>
      </section>

      <div className="grid-stats">
        <Stat label="Ληξιπρόθεσμα" cents={overdue} tone={overdue ? "bad" : "neutral"} />
        <Stat label="Εκκρεμή" cents={pending} tone="warn" />
        <Stat label="Μισθοδοσίες" cents={payroll} tone="neutral" />
        <Stat label="ΕΦΚΑ" cents={efka} tone="neutral" />
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Υποχρεώσεις</h2>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Εταιρεία</th>
                <th>Είδος</th>
                <th>Τίτλος</th>
                <th>Περίοδος</th>
                <th>Προθεσμία</th>
                <th>Ποσό</th>
                <th>Κατάσταση</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="chip">
                      <span className="dot" style={{ background: o.company_color }} />
                      {o.company_name}
                    </span>
                  </td>
                  <td>{OBLIGATION_LABELS[o.kind] ?? o.kind}</td>
                  <td>
                    <strong>{o.title}</strong>
                    {o.notes ? <div className="muted">{o.notes}</div> : null}
                  </td>
                  <td>{o.period_label || "—"}</td>
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

      <section className="section">
        <div className="section-head">
          <h2>Προσωπικό (ενεργό)</h2>
          <p className="muted">Βάση για υπολογισμό μισθοδοσίας / εισφορών</p>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Εταιρεία</th>
                <th>Όνομα</th>
                <th>Ρόλος</th>
                <th>Μικτές αποδοχές</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.company_name}</td>
                  <td>{e.full_name}</td>
                  <td>{e.role_title}</td>
                  <td>{centsToEuro(Number(e.gross_cents))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
