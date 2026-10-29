"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTransaction } from "@/app/transaktionen/actions";
import type { Category, CategoryKind } from "@/lib/types";

const inputClass = "rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700";

export default function TransactionForm({ categories, defaultDate }: { categories: Category[]; defaultDate: string }) {
  const [state, formAction, pending] = useActionState(createTransaction, {});
  const [kind, setKind] = useState<CategoryKind>("expense");
  const formRef = useRef<HTMLFormElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && amountRef.current) {
      amountRef.current.value = "";
      amountRef.current.focus();
      const note = formRef.current?.elements.namedItem("note");
      if (note instanceof HTMLInputElement) note.value = "";
    }
  }, [state]);

  const options = categories.filter((category) => category.kind === kind);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 dark:border-neutral-800">
      <fieldset className="flex gap-2 sm:col-span-2">
        <legend className="sr-only">Art</legend>
        {(["expense", "income"] as CategoryKind[]).map((value) => (
          <label
            key={value}
            className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${
              kind === value
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            <input
              type="radio"
              name="kind"
              value={value}
              checked={kind === value}
              onChange={() => setKind(value)}
              className="sr-only"
            />
            {value === "expense" ? "Ausgabe" : "Einnahme"}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 text-sm">
        Betrag (€)
        <input ref={amountRef} name="amount" inputMode="decimal" placeholder="12,50" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Datum
        <input name="occurred_on" type="date" defaultValue={defaultDate} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Kategorie
        <select key={kind} name="category_id" className={inputClass} defaultValue={options[0]?.id ?? ""}>
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value="">Ohne Kategorie</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notiz
        <input name="note" maxLength={200} placeholder={`z. B. ${kind === "expense" ? "Wocheneinkauf" : "Oktobergehalt"}`} className={inputClass} />
      </label>
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Speichern …" : `${kind === "expense" ? "Ausgabe" : "Einnahme"} speichern`}
      </button>
    </form>
  );
}
