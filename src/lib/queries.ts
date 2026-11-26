import { ensureSeeded, sql } from "./db";

export type Company = {
  id: string;
  name: string;
  short_name: string;
  afm: string;
  activity: string;
  color: string;
};

export type Transaction = {
  id: string;
  company_id: string;
  kind: "income" | "expense";
  amount_cents: number;
  category: string;
  description: string;
  entry_date: string;
  created_by: string;
  created_at: string;
  company_name?: string;
  company_color?: string;
};

export type Obligation = {
  id: string;
  company_id: string;
  kind: "payroll" | "efka" | "aade" | "vat" | "other";
  title: string;
  amount_cents: number;
  due_date: string;
  period_label: string;
  status: "pending" | "paid" | "overdue";
  paid_at: string | null;
  notes: string;
  company_name?: string;
  company_color?: string;
};

export type CompanyKpi = Company & {
  income_cents: number;
  expense_cents: number;
  net_cents: number;
  pending_obligations: number;
  overdue_cents: number;
};

function num(v: unknown): number {
  return Number(v ?? 0);
}

export async function getCompanies(): Promise<Company[]> {
  await ensureSeeded();
  return sql<Company>("select * from companies order by name");
}

export async function getCompany(id: string): Promise<Company | null> {
  await ensureSeeded();
  const rows = await sql<Company>("select * from companies where id = $1", [id]);
  return rows[0] ?? null;
}

export async function getOverviewKpis(): Promise<{
  companies: CompanyKpi[];
  totals: {
    income_cents: number;
    expense_cents: number;
    net_cents: number;
    overdue_cents: number;
    pending_count: number;
  };
}> {
  await ensureSeeded();
  const companies = await sql<Company>("select * from companies order by name");
  const finance = await sql<{
    company_id: string;
    income_cents: string;
    expense_cents: string;
  }>(`
    select company_id,
      coalesce(sum(case when kind = 'income' then amount_cents else 0 end), 0)::text as income_cents,
      coalesce(sum(case when kind = 'expense' then amount_cents else 0 end), 0)::text as expense_cents
    from transactions
    group by company_id
  `);
  const obligations = await sql<{
    company_id: string;
    pending_count: string;
    overdue_cents: string;
  }>(`
    select company_id,
      count(*) filter (where status <> 'paid')::text as pending_count,
      coalesce(sum(amount_cents) filter (where status = 'overdue'), 0)::text as overdue_cents
    from obligations
    group by company_id
  `);

  const finMap = new Map(finance.map((f) => [f.company_id, f]));
  const obMap = new Map(obligations.map((o) => [o.company_id, o]));

  const rows: CompanyKpi[] = companies.map((c) => {
    const f = finMap.get(c.id);
    const o = obMap.get(c.id);
    const income = num(f?.income_cents);
    const expense = num(f?.expense_cents);
    return {
      ...c,
      income_cents: income,
      expense_cents: expense,
      net_cents: income - expense,
      pending_obligations: num(o?.pending_count),
      overdue_cents: num(o?.overdue_cents),
    };
  });

  return {
    companies: rows,
    totals: {
      income_cents: rows.reduce((s, r) => s + r.income_cents, 0),
      expense_cents: rows.reduce((s, r) => s + r.expense_cents, 0),
      net_cents: rows.reduce((s, r) => s + r.net_cents, 0),
      overdue_cents: rows.reduce((s, r) => s + r.overdue_cents, 0),
      pending_count: rows.reduce((s, r) => s + r.pending_obligations, 0),
    },
  };
}

export async function getTransactions(companyId?: string): Promise<Transaction[]> {
  await ensureSeeded();
  if (companyId) {
    return sql<Transaction>(
      `select t.*, c.name as company_name, c.color as company_color
       from transactions t
       join companies c on c.id = t.company_id
       where t.company_id = $1
       order by t.entry_date desc, t.created_at desc`,
      [companyId],
    );
  }
  return sql<Transaction>(
    `select t.*, c.name as company_name, c.color as company_color
     from transactions t
     join companies c on c.id = t.company_id
     order by t.entry_date desc, t.created_at desc
     limit 100`,
  );
}

export async function getObligations(companyId?: string): Promise<Obligation[]> {
  await ensureSeeded();
  if (companyId) {
    return sql<Obligation>(
      `select o.*, c.name as company_name, c.color as company_color
       from obligations o
       join companies c on c.id = o.company_id
       where o.company_id = $1
       order by
         case o.status when 'overdue' then 0 when 'pending' then 1 else 2 end,
         o.due_date asc`,
      [companyId],
    );
  }
  return sql<Obligation>(
    `select o.*, c.name as company_name, c.color as company_color
     from obligations o
     join companies c on c.id = o.company_id
     order by
       case o.status when 'overdue' then 0 when 'pending' then 1 else 2 end,
       o.due_date asc`,
  );
}

export async function getEmployees(companyId?: string) {
  await ensureSeeded();
  if (companyId) {
    return sql<{
      id: string;
      company_id: string;
      full_name: string;
      role_title: string;
      gross_cents: number;
      active: boolean;
      company_name: string;
    }>(
      `select e.*, c.name as company_name
       from employees e join companies c on c.id = e.company_id
       where e.company_id = $1 and e.active = true
       order by e.full_name`,
      [companyId],
    );
  }
  return sql<{
    id: string;
    company_id: string;
    full_name: string;
    role_title: string;
    gross_cents: number;
    active: boolean;
    company_name: string;
  }>(
    `select e.*, c.name as company_name
     from employees e join companies c on c.id = e.company_id
     where e.active = true
     order by c.name, e.full_name`,
  );
}
