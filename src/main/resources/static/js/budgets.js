"use strict";

const month = monthFromUrl();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("month-switcher").replaceChildren(monthSwitcher(month, "/budgets"));
  load();
});

async function load() {
  let data;
  try {
    data = await api(`/api/budgets?month=${month}`);
  } catch (e) {
    showError(document.getElementById("load-error"), "Budgets konnten nicht geladen werden.");
    return;
  }

  const hasBudgets = data.rows.some((row) => row.budgetCents !== null);
  document.getElementById("summary").replaceChildren(
    hasBudgets
      ? h(
          "p",
          { class: "small" },
          "Gesamtbudget: ",
          h("strong", {}, formatCents(data.totalBudgetCents)),
          " · davon ausgegeben: ",
          h("strong", {}, formatCents(data.totalSpentCents)),
        )
      : h("button", { type: "button", class: "btn", onclick: copyPreviousMonth }, "Budgets aus dem Vormonat übernehmen"),
  );

  document.getElementById("budgets").replaceChildren(
    data.rows.length === 0
      ? h("p", { class: "muted" }, "Lege zuerst Ausgaben-Kategorien an.")
      : h("ul", { class: "list" }, data.rows.map(budgetRow)),
  );
}

async function copyPreviousMonth() {
  try {
    const { copied } = await api(`/api/budgets/copy-previous?month=${month}`, { method: "POST" });
    if (copied === 0) showError(document.getElementById("load-error"), "Im Vormonat gibt es keine Budgets.");
    await load();
  } catch (e) {
    showError(document.getElementById("load-error"), e.message);
  }
}

function budgetRow(row) {
  const error = h("p", { class: "error hidden", role: "alert" });
  const input = h("input", {
    class: "input budget-input",
    name: "amount",
    inputmode: "decimal",
    placeholder: "kein Budget",
    value: centsToInput(row.budgetCents),
    "aria-label": `Budget für ${row.categoryName}`,
  });
  const button = h("button", { type: "submit", class: "btn-text accent" }, "Speichern");

  const form = h(
    "form",
    {
      style: "display: flex; align-items: center; gap: 8px",
      onsubmit: async (event) => {
        event.preventDefault();
        showError(error, null);
        button.disabled = true;
        try {
          await api("/api/budgets", { method: "PUT", body: { categoryId: row.categoryId, month, amount: input.value } });
          await load();
        } catch (e) {
          showError(error, e.message);
          button.disabled = false;
        }
      },
    },
    input,
    h("span", { class: "muted" }, "€"),
    button,
  );

  return h(
    "li",
    { class: "stack", style: "gap: 8px" },
    h("div", { class: "row" }, h("span", { style: "font-weight: 500" }, row.categoryName), form),
    row.budgetCents !== null ? budgetBar(row.budgetCents, row.spentCents) : null,
    row.budgetCents === null && row.spentCents > 0 ? h("p", { class: "muted" }, `Ausgegeben: ${formatCents(row.spentCents)}`) : null,
    error,
  );
}
