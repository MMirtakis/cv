create table if not exists companies (
  id text primary key,
  name text not null,
  short_name text not null,
  afm text not null default '',
  activity text not null default '',
  color text not null default '#1f4b3a',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id text primary key,
  company_id text not null references companies(id),
  kind text not null check (kind in ('income', 'expense')),
  amount_cents integer not null check (amount_cents > 0),
  category text not null,
  description text not null default '',
  entry_date date not null,
  created_by text not null default 'συνεργάτης',
  created_at timestamptz not null default now()
);

create index if not exists transactions_company_date_idx
  on transactions (company_id, entry_date desc);

create table if not exists obligations (
  id text primary key,
  company_id text not null references companies(id),
  kind text not null check (kind in ('payroll', 'efka', 'aade', 'vat', 'other')),
  title text not null,
  amount_cents integer not null check (amount_cents >= 0),
  due_date date not null,
  period_label text not null default '',
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_at date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists obligations_due_idx
  on obligations (due_date, status);

create table if not exists employees (
  id text primary key,
  company_id text not null references companies(id),
  full_name text not null,
  role_title text not null default '',
  gross_cents integer not null default 0,
  active boolean not null default true
);
