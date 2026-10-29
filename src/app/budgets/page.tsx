import AppHeader from "@/components/AppHeader";
import BudgetRow from "@/components/BudgetRow";
import MonthSwitcher from "@/components/MonthSwitcher";
import { copyPreviousMonth } from "@/app/budgets/actions";
import { loadBudgetOverview } from "@/lib/budgets";
import { formatCents } from "@/lib/money";
import { parseMonth } from "@/lib/month";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Budgets · Finanz-Manager" };

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ monat?: string | string[] }>;
}) {
  const month = parseMonth((await searchParams).monat);
  const supabase = await createClient();
  const { rows, error } = await loadBudgetOverview(supabase, month);

  const totalBudget = rows.reduce((sum, row) => sum + (row.budgetCents ?? 0), 0);
  const totalSpent = rows.filter((row) => row.budgetCents !== null).reduce((sum, row) => sum + row.spentCents, 0);
  const hasBudgets = rows.some((row) => row.budgetCents !== null);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <AppHeader />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <MonthSwitcher month={month} basePath="/budgets" />
      </div>
      <p className="text-sm opacity-70">
        Lege fest, wie viel du pro Ausgaben-Kategorie in diesem Monat ausgeben willst. Ein leeres Feld entfernt das Budget.
      </p>

      {hasBudgets ? (
        <p className="text-sm">
          Gesamtbudget: <strong>{formatCents(totalBudget)}</strong> · davon ausgegeben:{" "}
          <strong>{formatCents(totalSpent)}</strong>
        </p>
      ) : (
        <form action={copyPreviousMonth}>
          <input type="hidden" name="month" value={month} />
          <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700">
            Budgets aus dem Vormonat übernehmen
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">Budgets konnten nicht geladen werden.</p>}
      {rows.length === 0 ? (
        <p className="text-sm opacity-60">Lege zuerst Ausgaben-Kategorien an.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((row) => (
            <BudgetRow key={row.categoryId} month={month} {...row} />
          ))}
        </ul>
      )}
    </main>
  );
}
