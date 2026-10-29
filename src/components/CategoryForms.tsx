"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCategory, deleteCategory, renameCategory } from "@/app/kategorien/actions";
import type { Category, CategoryKind } from "@/lib/types";

const inputClass = "rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700";

export function NewCategoryForm({ kind }: { kind: CategoryKind }) {
  const [state, formAction, pending] = useActionState(createCategory, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex gap-2">
        <input name="name" placeholder="Neue Kategorie" maxLength={50} required className={`${inputClass} flex-1`} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Hinzufügen
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
    </form>
  );
}

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(renameCategory, {});

  useEffect(() => {
    if (!pending && !state.error) setEditing(false);
  }, [pending, state]);

  if (editing) {
    return (
      <li className="flex flex-col gap-1 py-2">
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input name="name" defaultValue={category.name} maxLength={50} required autoFocus className={`${inputClass} flex-1`} />
          <button type="submit" disabled={pending} className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Speichern
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-sm opacity-70">
            Abbrechen
          </button>
        </form>
        {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 py-2">
      <span>{category.name}</span>
      <div className="flex gap-3 text-sm">
        <button type="button" onClick={() => setEditing(true)} className="opacity-70 hover:opacity-100">
          Umbenennen
        </button>
        <form
          action={deleteCategory}
          onSubmit={(event) => {
            if (!window.confirm(`Kategorie „${category.name}“ löschen? Zugehörige Budgets werden ebenfalls gelöscht.`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" className="text-red-600 opacity-80 hover:opacity-100">
            Löschen
          </button>
        </form>
      </div>
    </li>
  );
}
