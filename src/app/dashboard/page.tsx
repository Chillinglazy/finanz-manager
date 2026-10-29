import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BudgetBar from "@/components/BudgetBar";
import MonthSwitcher from "@/components/MonthSwitcher";
import { loadBudgetOverview } from "@/lib/budgets";
import { formatCents } from "@/lib/money";
import { formatMonth, parseMonth } from "@/lib/month";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · Finanz-Manager" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ monat?: string | string[] }>;
}) {
  const month = parseMonth((await searchParams).monat);
  const supabase = await createClient();
  const { rows, incomeCents, expenseCents, error } = await loadBudgetOverview(supabase, month);

  const budgeted = rows.filter((row) => row.budgetCents !== null);
  const totalBudget = budgeted.reduce((sum, row) => sum + (row.budgetCents ?? 0), 0);
  const spentInBudgets = budgeted.reduce((sum, row) => sum + row.spentCents, 0);
  const overBudget = budgeted.filter((row) => row.spentCents > (row.budgetCents ?? 0));
  const uncategorizedCents = expenseCents - rows.reduce((sum, row) => sum + row.spentCents, 0);

  const spending = rows
    .filter((row) => row.spentCents > 0)
    .map((row) => ({ name: row.categoryName, cents: row.spentCents }))
    .concat(uncategorizedCents > 0 ? [{ name: "Ohne Kategorie", cents: uncategorizedCents }] : [])
    .sort((a, b) => b.cents - a.cents);
  const maxSpending = spending[0]?.cents ?? 0;
  const balance = incomeCents - expenseCents;

  const tiles = [
    { label: "Einnahmen", value: formatCents(incomeCents), className: "bg-emerald-50 dark:bg-emerald-950" },
    { label: "Ausgaben", value: formatCents(expenseCents), className: "bg-red-50 dark:bg-red-950" },
    { label: "Saldo", value: formatCents(balance), className: "bg-neutral-100 dark:bg-neutral-900" },
    {
      label: "Budget übrig",
      value: budgeted.length ? formatCents(totalBudget - spentInBudgets) : "–",
      className: "bg-neutral-100 dark:bg-neutral-900",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6">
      <AppHeader />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthSwitcher month={month} basePath="/dashboard" />
      </div>

      {error && <p className="text-sm text-red-600">Daten konnten nicht geladen werden.</p>}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-lg p-4 ${tile.className}`}>
            <dt className="text-sm opacity-70">{tile.label}</dt>
            <dd className="text-xl font-semibold tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      {overBudget.length > 0 && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200" role="alert">
          Budget überschritten: {overBudget.map((row) => row.categoryName).join(", ")}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Budgets</h2>
          <Link href={`/budgets?monat=${month}`} className="text-sm text-emerald-700 underline dark:text-emerald-400">
            Budgets bearbeiten
          </Link>
        </div>
        {budgeted.length === 0 ? (
          <p className="text-sm opacity-60">Für {formatMonth(month)} sind noch keine Budgets festgelegt.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {budgeted.map((row) => (
              <li key={row.categoryId} className="flex flex-col gap-1">
                <span className="text-sm font-medium">{row.categoryName}</span>
                <BudgetBar budgetCents={row.budgetCents ?? 0} spentCents={row.spentCents} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Ausgaben nach Kategorie</h2>
          <Link href={`/transaktionen?monat=${month}`} className="text-sm text-emerald-700 underline dark:text-emerald-400">
            Transaktionen
          </Link>
        </div>
        {spending.length === 0 ? (
          <p className="text-sm opacity-60">In diesem Monat gibt es noch keine Ausgaben.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {spending.map((item) => (
              <li key={item.name} className="grid grid-cols-[8rem_1fr_6rem] items-center gap-3 text-sm">
                <span className="truncate">{item.name}</span>
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(item.cents / maxSpending) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums">{formatCents(item.cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
