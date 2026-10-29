import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <AppHeader />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="opacity-80">Angemeldet als {user.email}.</p>
      <p className="text-sm opacity-60">Budgets und Ausgaben folgen in Kürze.</p>
    </main>
  );
}
