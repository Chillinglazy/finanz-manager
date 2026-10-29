"use client";

import { useActionState } from "react";
import { saveBudget } from "@/app/budgets/actions";
import { formatCents } from "@/lib/money";
import BudgetBar from "@/components/BudgetBar";

type Props = {
  categoryId: string;
  categoryName: string;
  month: string;
  budgetCents: number | null;
  spentCents: number;
};

function centsToInput(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

export default function BudgetRow({ categoryId, categoryName, month, budgetCents, spentCents }: Props) {
  const [state, formAction, pending] = useActionState(saveBudget, {});

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium">{categoryName}</span>
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="month" value={month} />
          <input
            key={`${month}-${budgetCents}`}
            name="amount"
            inputMode="decimal"
            placeholder="kein Budget"
            defaultValue={centsToInput(budgetCents)}
            aria-label={`Budget für ${categoryName}`}
            className="w-32 rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-right text-sm dark:border-neutral-700"
          />
          <span className="text-sm opacity-60">€</span>
          <button type="submit" disabled={pending} className="text-sm font-medium text-emerald-700 disabled:opacity-60 dark:text-emerald-400">
            {pending ? "…" : "Speichern"}
          </button>
        </form>
      </div>
      {budgetCents !== null && <BudgetBar budgetCents={budgetCents} spentCents={spentCents} />}
      {budgetCents === null && spentCents > 0 && (
        <p className="text-sm opacity-60">Ausgegeben: {formatCents(spentCents)}</p>
      )}
      {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
    </li>
  );
}
