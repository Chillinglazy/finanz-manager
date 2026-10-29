import Link from "next/link";
import BudgetBar from "@/components/BudgetBar";
import { formatCents } from "@/lib/money";

const FEATURES = [
  {
    icon: "🎯",
    title: "Budgets pro Kategorie",
    text: "Lege fest, wie viel du jeden Monat für Miete, Essen oder Freizeit ausgeben willst, und sieh sofort, wie viel noch übrig ist.",
  },
  {
    icon: "🏷️",
    title: "Eigene Kategorien",
    text: "Starte mit sinnvollen Standard-Kategorien und passe sie an dein Leben an: anlegen, umbenennen, löschen.",
  },
  {
    icon: "📊",
    title: "Alles auf einen Blick",
    text: "Einnahmen, Ausgaben und Saldo pro Monat, mit Warnung, sobald ein Budget überschritten wird.",
  },
];

const PREVIEW_BUDGETS = [
  { name: "Lebensmittel", budget: 40000, spent: 28750 },
  { name: "Freizeit", budget: 15000, spent: 13200 },
  { name: "Transport", budget: 8000, spent: 9150 },
];

function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl shadow-emerald-900/5 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-semibold">Oktober 2026</span>
        <span className="text-xs opacity-60">Dashboard</span>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
          <div className="opacity-70">Einnahmen</div>
          <div className="text-sm font-semibold tabular-nums">{formatCents(285000)}</div>
        </div>
        <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950">
          <div className="opacity-70">Ausgaben</div>
          <div className="text-sm font-semibold tabular-nums">{formatCents(171100)}</div>
        </div>
        <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900">
          <div className="opacity-70">Saldo</div>
          <div className="text-sm font-semibold tabular-nums">{formatCents(113900)}</div>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {PREVIEW_BUDGETS.map((item) => (
          <li key={item.name} className="flex flex-col gap-1">
            <span className="text-sm font-medium">{item.name}</span>
            <BudgetBar budgetCents={item.budget} spentCents={item.spent} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">
          <span className="text-emerald-600">€</span> Finanz-Manager
        </span>
        <Link href="/login" className="text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-400">
          Anmelden
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Behalte dein Geld im Griff, <span className="text-emerald-600">Monat für Monat.</span>
            </h1>
            <p className="text-lg opacity-80">
              Erfasse Einnahmen und Ausgaben, setze Budgets pro Kategorie und erkenne auf einen Blick, wo dein Geld hingeht.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/registrieren"
                className="rounded-md bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-neutral-300 px-5 py-3 font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Anmelden
              </Link>
            </div>
            <p className="text-sm opacity-60">Kostenlos · Deine Daten sieht nur du</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <DashboardPreview />
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm opacity-80">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">In zwei Minuten startklar</h2>
          <p className="max-w-xl opacity-80">
            Konto anlegen, Standard-Kategorien sind schon da, erste Ausgabe eintragen. Fertig.
          </p>
          <Link href="/registrieren" className="rounded-md bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700">
            Jetzt loslegen
          </Link>
        </section>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-6 py-6 text-sm opacity-60">
          <span>© {new Date().getFullYear()} Finanz-Manager</span>
          <span>Gemacht für deine persönlichen Finanzen</span>
        </div>
      </footer>
    </div>
  );
}
