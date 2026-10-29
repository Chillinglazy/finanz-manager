import AppHeader from "@/components/AppHeader";
import { CategoryRow, NewCategoryForm } from "@/components/CategoryForms";
import { createClient } from "@/lib/supabase/server";
import { KIND_LABELS, type Category, type CategoryKind } from "@/lib/types";

export const metadata = { title: "Kategorien · Finanz-Manager" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, color")
    .order("name");
  const categories = (data ?? []) as Category[];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <AppHeader />
      <h1 className="text-2xl font-bold">Kategorien</h1>
      {error && <p className="text-sm text-red-600">Kategorien konnten nicht geladen werden.</p>}
      <div className="grid gap-8 sm:grid-cols-2">
        {(["expense", "income"] as CategoryKind[]).map((kind) => {
          const items = categories.filter((category) => category.kind === kind);
          return (
            <section key={kind} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{KIND_LABELS[kind]}</h2>
              {items.length === 0 ? (
                <p className="text-sm opacity-60">Noch keine Kategorien.</p>
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {items.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </ul>
              )}
              <NewCategoryForm kind={kind} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
