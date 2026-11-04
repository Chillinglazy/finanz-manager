"use strict";

// Statische Vorschau mit Beispielzahlen (keine echten Daten).
const PREVIEW_BUDGETS = [
  { name: "Lebensmittel", budget: 40000, spent: 28750 },
  { name: "Freizeit", budget: 15000, spent: 13200 },
  { name: "Transport", budget: 8000, spent: 9150 },
];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("preview-budgets").replaceChildren(
    ...PREVIEW_BUDGETS.map((item) =>
      h("li", {}, h("div", { class: "small", style: "font-weight: 500" }, item.name), budgetBar(item.budget, item.spent)),
    ),
  );
});
