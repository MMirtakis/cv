import { QuickEntryForm } from "@/components/QuickEntryForm";
import { getCompanies, getTransactions } from "@/lib/queries";
import { asDateString, centsToEuro } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const companies = await getCompanies();
  const recent = (await getTransactions()).slice(0, 8);

  return (
    <>
      <section className="hero">
        <h1>Γρήγορη καταχώρηση</h1>
        <p>
          Φτιαγμένο για τον συνεργάτη: λίγα πεδία, μεγάλα κουμπιά, άμεση
          αποθήκευση εσόδου ή εξόδου.
        </p>
      </section>

      <div className="entry-layout">
        <QuickEntryForm
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        />

        <aside className="tips">
          <h2>Πώς το χρησιμοποιείς</h2>
          <ol>
            <li>Διάλεξε εταιρεία και αν είναι έσοδο ή έξοδο.</li>
            <li>Βάλε το ποσό όπως το βλέπεις στο τιμολόγιο.</li>
            <li>Επίλεξε κατηγορία — η περιγραφή είναι προαιρετική.</li>
            <li>Αποθήκευση. Φαίνεται αμέσως στα οικονομικά και στα KPIs.</li>
          </ol>
        </aside>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Τελευταίες καταχωρήσεις</h2>
        </div>
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Ημ/νία</th>
                <th>Εταιρεία</th>
                <th>Κατηγορία</th>
                <th>Ποσό</th>
                <th>Από</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id}>
                  <td>{asDateString(t.entry_date)}</td>
                  <td>{t.company_name}</td>
                  <td>
                    <span className={`badge badge-${t.kind}`}>
                      {t.kind === "income" ? "Έσοδο" : "Έξοδο"}
                    </span>{" "}
                    {t.category}
                  </td>
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
