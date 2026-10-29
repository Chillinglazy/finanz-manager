import AppHeader from "@/components/AppHeader";
import MonthSwitcher from "@/components/MonthSwitcher";
import TransactionForm from "@/components/TransactionForm";
import { deleteTransaction } from "@/app/transaktionen/actions";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/money";
import { currentMonth, monthRange, parseMonth } from "@/lib/month";
import type { Category, CategoryKind } from "@/lib/types";

export const metadata = { title: "Transaktionen · Finanz-Manager" };

type Transaction = {
  id: string;
  kind: CategoryKind;
  amount_cents: number;
  occurred_on: string;
  note: string | null;
  categories: { name: string } | null;
};

const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ monat?: string | string[] }>;
}) {
  const month = parseMonth((await searchParams).monat);
  const { start, end } = monthRange(month);
  const supabase = await createClient();

  const [{ data: categoryData }, { data: transactionData, error }] = await Promise.all([
    supabase.from("categories").select("id, name, kind, color").order("name"),
    supabase
      .from("transactions")
      .select("id, kind, amount_cents, occurred_on, note, categories(name)")
      .gte("occurred_on", start)
      .lt("occurred_on", end)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const categories = (categoryData ?? []) as Category[];
  const transactions = (transactionData ?? []) as unknown as Transaction[];

  const income = transactions.filter((t) => t.kind === "income").reduce((sum, t) => sum + t.amount_cents, 0);
  const expenses = transactions.filter((t) => t.kind === "expense").reduce((sum, t) => sum + t.amount_cents, 0);
  const now = new Date();
  const today = `${currentMonth()}-${String(now.getDate()).padStart(2, "0")}`;
  const defaultDate = month === currentMonth() ? today : start;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <AppHeader />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transaktionen</h1>
        <MonthSwitcher month={month} basePath="/transaktionen" />
      </div>

      <TransactionForm categories={categories} defaultDate={defaultDate} />

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <dt className="opacity-70">Einnahmen</dt>
          <dd className="text-lg font-semibold">{formatCents(income)}</dd>
        </div>
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <dt className="opacity-70">Ausgaben</dt>
          <dd className="text-lg font-semibold">{formatCents(expenses)}</dd>
        </div>
        <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
          <dt className="opacity-70">Saldo</dt>
          <dd className="text-lg font-semibold">{formatCents(income - expenses)}</dd>
        </div>
      </dl>

      {error && <p className="text-sm text-red-600">Transaktionen konnten nicht geladen werden.</p>}
      {transactions.length === 0 ? (
        <p className="text-sm opacity-60">In diesem Monat gibt es noch keine Transaktionen.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{t.categories?.name ?? "Ohne Kategorie"}</span>
                <span className="text-sm opacity-60">
                  {dateFormat.format(new Date(`${t.occurred_on}T00:00:00`))}
                  {t.note ? ` · ${t.note}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold tabular-nums ${t.kind === "income" ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                  {t.kind === "income" ? "+" : "−"}
                  {formatCents(t.amount_cents)}
                </span>
                <form action={deleteTransaction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="text-sm text-red-600 opacity-70 hover:opacity-100" aria-label="Transaktion löschen">
                    Löschen
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
