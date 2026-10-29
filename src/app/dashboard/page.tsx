import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline opacity-80 hover:opacity-100">
            Abmelden
          </button>
        </form>
      </header>
      <p className="opacity-80">Angemeldet als {user.email}.</p>
      <p className="text-sm opacity-60">Budgets und Ausgaben folgen in Kürze.</p>
    </main>
  );
}
