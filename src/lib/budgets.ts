import type { SupabaseClient } from "@supabase/supabase-js";
import { monthRange } from "@/lib/month";

export type BudgetOverviewRow = {
  categoryId: string;
  categoryName: string;
  budgetCents: number | null;
  spentCents: number;
};

/** Lädt Ausgaben-Kategorien mit Budget und Ausgaben des Monats. */
export async function loadBudgetOverview(supabase: SupabaseClient, month: string) {
  const { start, end } = monthRange(month);
  const [categories, budgets, transactions] = await Promise.all([
    supabase.from("categories").select("id, name").eq("kind", "expense").order("name"),
    supabase.from("budgets").select("category_id, amount_cents").eq("month", start),
    supabase
      .from("transactions")
      .select("category_id, kind, amount_cents")
      .gte("occurred_on", start)
      .lt("occurred_on", end),
  ]);

  const error = categories.error ?? budgets.error ?? transactions.error;
  const budgetByCategory = new Map((budgets.data ?? []).map((b) => [b.category_id, b.amount_cents as number]));
  const spentByCategory = new Map<string, number>();
  let incomeCents = 0;
  let expenseCents = 0;
  for (const t of transactions.data ?? []) {
    if (t.kind === "income") {
      incomeCents += t.amount_cents;
      continue;
    }
    expenseCents += t.amount_cents;
    if (t.category_id) spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount_cents);
  }

  const rows: BudgetOverviewRow[] = (categories.data ?? []).map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    budgetCents: budgetByCategory.get(c.id) ?? null,
    spentCents: spentByCategory.get(c.id) ?? 0,
  }));

  return { rows, incomeCents, expenseCents, error };
}
