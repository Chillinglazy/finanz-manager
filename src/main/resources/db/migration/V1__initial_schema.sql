-- Grundschema: Nutzer, Kategorien, Transaktionen, monatliche Budgets.
-- Beträge in Cent (bigint). Jede Tabelle mit Nutzerdaten hat eine user_id;
-- das Backend filtert jede Abfrage auf den angemeldeten Nutzer.

create table app_users (
  id uuid primary key,
  email varchar(255) not null unique,
  password_hash varchar(100) not null,
  created_at timestamp with time zone not null default current_timestamp
);

create table categories (
  id uuid primary key,
  user_id uuid not null references app_users (id) on delete cascade,
  name varchar(50) not null check (char_length(name) between 1 and 50),
  kind varchar(10) not null check (kind in ('INCOME', 'EXPENSE')),
  color varchar(20),
  created_at timestamp with time zone not null default current_timestamp,
  unique (user_id, name, kind)
);

create table transactions (
  id uuid primary key,
  user_id uuid not null references app_users (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  amount_cents bigint not null check (amount_cents > 0),
  kind varchar(10) not null check (kind in ('INCOME', 'EXPENSE')),
  occurred_on date not null,
  note varchar(200),
  created_at timestamp with time zone not null default current_timestamp
);

create index transactions_user_date_idx on transactions (user_id, occurred_on);

create table budgets (
  id uuid primary key,
  user_id uuid not null references app_users (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  amount_cents bigint not null check (amount_cents >= 0),
  created_at timestamp with time zone not null default current_timestamp,
  unique (user_id, category_id, month)
);
