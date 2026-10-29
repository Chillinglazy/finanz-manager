import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Finanz-Manager</h1>
      <p className="text-lg opacity-80">
        Behalte deine Budgets, Kategorien und Ausgaben im Blick.
      </p>
      <div className="flex gap-3">
        <Link href="/registrieren" className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
          Kostenlos registrieren
        </Link>
        <Link href="/login" className="rounded-md border border-neutral-300 px-4 py-2 font-medium dark:border-neutral-700">
          Anmelden
        </Link>
      </div>
    </main>
  );
}
