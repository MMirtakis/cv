import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, sql } from "@/lib/db";
import { parseEuroToCents, uid } from "@/lib/format";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const companyId = req.nextUrl.searchParams.get("companyId");
  const rows = companyId
    ? await sql(
        `select * from transactions where company_id = $1 order by entry_date desc`,
        [companyId],
      )
    : await sql(`select * from transactions order by entry_date desc limit 100`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const body = await req.json();
  const companyId = String(body.companyId ?? "");
  const kind = body.kind === "expense" ? "expense" : "income";
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim().slice(0, 200);
  const createdBy = String(body.createdBy ?? "συνεργάτης").trim().slice(0, 60) || "συνεργάτης";
  const entryDate = String(body.entryDate ?? new Date().toISOString().slice(0, 10));
  const amountCents =
    typeof body.amountCents === "number"
      ? Math.round(body.amountCents)
      : parseEuroToCents(String(body.amount ?? ""));

  if (!companyId || !category || !amountCents || amountCents <= 0) {
    return NextResponse.json({ error: "Συμπλήρωσε εταιρεία, κατηγορία και ποσό." }, { status: 400 });
  }

  const companies = await sql<{ id: string }>(
    "select id from companies where id = $1",
    [companyId],
  );
  if (!companies[0]) {
    return NextResponse.json({ error: "Άγνωστη εταιρεία." }, { status: 400 });
  }

  const id = uid("tx");
  await sql(
    `insert into transactions
      (id, company_id, kind, amount_cents, category, description, entry_date, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, companyId, kind, amountCents, category, description, entryDate, createdBy],
  );

  return NextResponse.json({ id }, { status: 201 });
}
