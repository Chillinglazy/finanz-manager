-- Grundschema: Kategorien, Transaktionen, monatliche Budgets.
-- Beträge in Cent (bigint). Jede Tabelle ist per RLS auf den eigenen Nutzer beschränkt.

create type public.category_kind as enum ('income', 'expense');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  kind public.category_kind not null default 'expense',
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name, kind)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  amount_cents bigint not null check (amount_cents > 0),
  kind public.category_kind not null,
  occurred_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  amount_cents bigint not null check (amount_cents >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "own categories" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own transactions" on public.transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own budgets" on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Standard-Kategorien für neue Nutzer.
create function public.create_default_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (user_id, name, kind) values
    (new.id, 'Gehalt', 'income'),
    (new.id, 'Sonstige Einnahmen', 'income'),
    (new.id, 'Miete', 'expense'),
    (new.id, 'Lebensmittel', 'expense'),
    (new.id, 'Transport', 'expense'),
    (new.id, 'Freizeit', 'expense'),
    (new.id, 'Versicherungen', 'expense'),
    (new.id, 'Sonstiges', 'expense');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_categories();
