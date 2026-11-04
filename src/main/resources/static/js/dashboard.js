"use strict";

const month = monthFromUrl();

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("month-switcher").replaceChildren(monthSwitcher(month, "/dashboard"));
  document.getElementById("budgets-link").href = `/budgets?monat=${month}`;
  document.getElementById("transactions-link").href = `/transaktionen?monat=${month}`;

  try {
    render(await api(`/api/dashboard?month=${month}`));
  } catch (e) {
    showError(document.getElementById("load-error"), "Daten konnten nicht geladen werden.");
  }
});

function render(data) {
  const tiles = [
    ["Einnahmen", formatCents(data.incomeCents), "income"],
    ["Ausgaben", formatCents(data.expenseCents), "expense"],
    ["Saldo", formatCents(data.balanceCents), ""],
    ["Budget übrig", data.budgetLeftCents === null ? "–" : formatCents(data.budgetLeftCents), ""],
  ];
  document.getElementById("tiles").replaceChildren(
    ...tiles.map(([label, value, kind]) => h("div", { class: `tile ${kind}` }, h("dt", {}, label), h("dd", {}, value))),
  );

  const over = document.getElementById("over-budget");
  over.textContent = `Budget überschritten: ${data.overBudget.join(", ")}`;
  over.classList.toggle("hidden", data.overBudget.length === 0);

  document.getElementById("budgets").replaceChildren(
    data.budgets.length === 0
      ? h("p", { class: "muted" }, `Für ${formatMonth(month)} sind noch keine Budgets festgelegt.`)
      : h(
          "ul",
          { class: "stack", style: "list-style: none; margin: 0; padding: 0; gap: 16px" },
          data.budgets.map((row) =>
            h("li", {}, h("div", { class: "small", style: "font-weight: 500" }, row.categoryName), budgetBar(row.budgetCents, row.spentCents)),
          ),
        ),
  );

  const max = data.spending[0]?.cents ?? 0;
  document.getElementById("spending").replaceChildren(
    data.spending.length === 0
      ? h("p", { class: "muted" }, "In diesem Monat gibt es noch keine Ausgaben.")
      : h(
          "ul",
          { class: "stack", style: "list-style: none; margin: 0; padding: 0; gap: 8px" },
          data.spending.map((item) =>
            h(
              "li",
              { class: "spending" },
              h("span", { class: "name" }, item.name),
              h("div", { class: "bar" }, h("div", { style: `width: ${(item.cents / max) * 100}%` })),
              h("span", { class: "num" }, formatCents(item.cents)),
            ),
          ),
        ),
  );
}
