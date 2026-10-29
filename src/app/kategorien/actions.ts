"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CategoryKind } from "@/lib/types";

export type CategoryState = { error?: string };

const DUPLICATE = "23505";

function readName(formData: FormData) {
  return String(formData.get("name") ?? "").trim();
}

export async function createCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  const name = readName(formData);
  const kind: CategoryKind = formData.get("kind") === "income" ? "income" : "expense";
  if (!name) return { error: "Bitte einen Namen eingeben." };
  if (name.length > 50) return { error: "Der Name darf höchstens 50 Zeichen haben." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, kind });
  if (error) {
    return { error: error.code === DUPLICATE ? "Diese Kategorie gibt es schon." : "Speichern fehlgeschlagen." };
  }

  revalidatePath("/kategorien");
  return {};
}

export async function renameCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  const id = String(formData.get("id") ?? "");
  const name = readName(formData);
  if (!name) return { error: "Bitte einen Namen eingeben." };
  if (name.length > 50) return { error: "Der Name darf höchstens 50 Zeichen haben." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ name }).eq("id", id);
  if (error) {
    return { error: error.code === DUPLICATE ? "Diese Kategorie gibt es schon." : "Speichern fehlgeschlagen." };
  }

  revalidatePath("/kategorien");
  return {};
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  // Transaktionen behalten ihren Betrag, verlieren nur die Kategorie; Budgets werden mitgelöscht.
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/kategorien");
}
