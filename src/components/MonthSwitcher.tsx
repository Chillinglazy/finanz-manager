import Link from "next/link";
import { formatMonth, shiftMonth } from "@/lib/month";

export default function MonthSwitcher({ month, basePath }: { month: string; basePath: string }) {
  const linkClass = "rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700";
  return (
    <div className="flex items-center gap-3">
      <Link href={`${basePath}?monat=${shiftMonth(month, -1)}`} className={linkClass} aria-label="Vorheriger Monat">
        ←
      </Link>
      <span className="min-w-36 text-center font-medium">{formatMonth(month)}</span>
      <Link href={`${basePath}?monat=${shiftMonth(month, 1)}`} className={linkClass} aria-label="Nächster Monat">
        →
      </Link>
    </div>
  );
}
