"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseEuroToCents } from "@/lib/money";
import type { CategoryKind } from "@/lib/types";

export type TransactionState = { error?: string; ok?: boolean };

export async function createTransaction(_prev: TransactionState, formData: FormData): Promise<TransactionState> {
  const kind: CategoryKind = formData.get("kind") === "income" ? "income" : "expense";
  const amountCents = parseEuroToCents(String(formData.get("amount") ?? ""));
  const occurredOn = String(formData.get("occurred_on") ?? "");
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!amountCents) return { error: "Bitte einen gültigen Betrag größer 0 eingeben, z. B. 12,50." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) return { error: "Bitte ein gültiges Datum wählen." };
  if (note && note.length > 200) return { error: "Die Notiz darf höchstens 200 Zeichen haben." };

  const supabase = await createClient();

  if (categoryId) {
    const { data: category } = await supabase.from("categories").select("kind").eq("id", categoryId).single();
    if (!category) return { error: "Kategorie nicht gefunden." };
    if (category.kind !== kind) return { error: "Die Kategorie passt nicht zur Art (Einnahme/Ausgabe)." };
  }

  const { error } = await supabase.from("transactions").insert({
    kind,
    amount_cents: amountCents,
    occurred_on: occurredOn,
    category_id: categoryId,
    note,
  });
  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidatePath("/transaktionen");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/transaktionen");
  revalidatePath("/dashboard");
}
