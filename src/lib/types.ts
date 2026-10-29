export type CategoryKind = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string | null;
};

export const KIND_LABELS: Record<CategoryKind, string> = {
  income: "Einnahmen",
  expense: "Ausgaben",
};
