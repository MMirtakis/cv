import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, sql } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  await ensureSeeded();
  const body = await req.json();
  const id = String(body.id ?? "");
  const status = body.status === "paid" ? "paid" : body.status === "pending" ? "pending" : null;

  if (!id || !status) {
    return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 });
  }

  if (status === "paid") {
    await sql(
      `update obligations set status = 'paid', paid_at = current_date where id = $1`,
      [id],
    );
  } else {
    await sql(
      `update obligations set status = 'pending', paid_at = null where id = $1`,
      [id],
    );
  }

  return NextResponse.json({ ok: true });
}
