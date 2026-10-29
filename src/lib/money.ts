const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function formatCents(cents: number) {
  return euro.format(cents / 100);
}

/** Wandelt eine Eingabe wie "12,50", "1.234,5" oder "7" in Cent um; null bei ungültiger Eingabe. */
export function parseEuroToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
