"use strict";

// Statische Vorschau mit Beispielzahlen (keine echten Daten).
const PREVIEW_BUDGETS = [
  { name: "Lebensmittel", budget: 40000, spent: 28750 },
  { name: "Freizeit", budget: 15000, spent: 13200 },
  { name: "Transport", budget: 8000, spent: 9150 },
];

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("preview-budgets").replaceChildren(
    ...PREVIEW_BUDGETS.map((item) =>
      h("li", {}, h("div", { class: "small", style: "font-weight: 500" }, item.name), budgetBar(item.budget, item.spent)),
    ),
  );

  // Angemeldet: statt „Anmelden“ direkt zum Dashboard.
  if (await currentUser()) {
    const header = document.getElementById("header-link");
    header.href = "/dashboard";
    header.replaceChildren(icon("📊"), "Zum Dashboard");
    document.getElementById("hero-actions").replaceChildren(
      h("a", { href: "/dashboard", class: "btn btn-primary btn-large" }, icon("📊"), "Zum Dashboard"),
    );
    const cta = document.getElementById("cta-link");
    cta.href = "/dashboard";
    cta.replaceChildren(icon("📊"), "Zum Dashboard");
  }
});
