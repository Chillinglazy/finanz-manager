import Link from "next/link";
import { logout } from "@/app/auth/actions";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transaktionen", label: "Transaktionen" },
  { href: "/budgets", label: "Budgets" },
  { href: "/kategorien", label: "Kategorien" },
];

export default function AppHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
      <nav className="flex gap-4 text-sm font-medium">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-emerald-700 dark:hover:text-emerald-400">
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logout}>
        <button type="submit" className="text-sm underline opacity-80 hover:opacity-100">
          Abmelden
        </button>
      </form>
    </header>
  );
}
