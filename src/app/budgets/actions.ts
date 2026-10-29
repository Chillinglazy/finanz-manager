"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseEuroToCents } from "@/lib/money";
import { parseMonth, shiftMonth } from "@/lib/month";

export type BudgetState = { error?: string; ok?: boolean };

function revalidate() {
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function saveBudget(_prev: BudgetState, formData: FormData): Promise<BudgetState> {
  const categoryId = String(formData.get("category_id") ?? "");
  const month = parseMonth(String(formData.get("month") ?? ""));
  const raw = String(formData.get("amount") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Leeres Feld entfernt das Budget.
  if (!raw) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("category_id", categoryId)
      .eq("month", `${month}-01`);
    if (error) return { error: "Löschen fehlgeschlagen." };
    revalidate();
    return { ok: true };
  }

  const amountCents = parseEuroToCents(raw);
  if (amountCents === null) return { error: "Ungültiger Betrag." };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, category_id: categoryId, month: `${month}-01`, amount_cents: amountCents },
      { onConflict: "user_id,category_id,month" },
    );
  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidate();
  return { ok: true };
}

/** Übernimmt alle Budgets des Vormonats, ohne bestehende Budgets zu überschreiben. */
export async function copyPreviousMonth(formData: FormData) {
  const month = parseMonth(String(formData.get("month") ?? ""));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: previous } = await supabase
    .from("budgets")
    .select("category_id, amount_cents")
    .eq("month", `${shiftMonth(month, -1)}-01`);
  if (!previous?.length) return;

  await supabase.from("budgets").upsert(
    previous.map((budget) => ({ ...budget, user_id: user.id, month: `${month}-01` })),
    { onConflict: "user_id,category_id,month", ignoreDuplicates: true },
  );
  revalidate();
}
