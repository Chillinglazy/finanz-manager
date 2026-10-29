import { formatCents } from "@/lib/money";

/** Fortschrittsbalken „ausgegeben von Budget“; ab 80 % gelb, über 100 % rot. */
export default function BudgetBar({ budgetCents, spentCents }: { budgetCents: number; spentCents: number }) {
  const ratio = budgetCents > 0 ? spentCents / budgetCents : spentCents > 0 ? 2 : 0;
  const color = ratio > 1 ? "bg-red-600" : ratio >= 0.8 ? "bg-amber-500" : "bg-emerald-600";
  const remaining = budgetCents - spentCents;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
      >
        <div className={`h-full ${color}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs opacity-70">
        <span>
          {formatCents(spentCents)} von {formatCents(budgetCents)}
        </span>
        <span className={remaining < 0 ? "font-semibold text-red-600 opacity-100" : ""}>
          {remaining < 0 ? `${formatCents(-remaining)} drüber` : `${formatCents(remaining)} übrig`}
        </span>
      </div>
    </div>
  );
}
