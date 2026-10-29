/** Monate werden als "YYYY-MM" in der URL geführt, z. B. ?monat=2026-10. */

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonth(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : currentMonth();
}

export function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Erster Tag des Monats und erster Tag des Folgemonats als ISO-Datum. */
export function monthRange(month: string) {
  return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

export function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(year, m - 1, 1));
}
