"use strict";

const month = monthFromUrl();
let categories = [];

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("month-switcher").replaceChildren(monthSwitcher(month, "/transaktionen"));

  const form = document.getElementById("transaction-form");
  const today = new Date();
  const todayIso = `${currentMonth()}-${String(today.getDate()).padStart(2, "0")}`;
  form.occurredOn.value = month === currentMonth() ? todayIso : `${month}-01`;
  form.addEventListener("change", (event) => {
    if (event.target.name === "kind") updateKind(form);
  });
  form.addEventListener("submit", (event) => submit(event, form));

  try {
    categories = await api("/api/categories");
    updateKind(form);
    await loadTransactions();
  } catch (e) {
    showError(document.getElementById("load-error"), "Transaktionen konnten nicht geladen werden.");
  }
});

/** Passt Kategorien-Auswahl, Platzhalter und Button an Ausgabe/Einnahme an. */
function updateKind(form) {
  const kind = form.kind.value;
  const isExpense = kind === "EXPENSE";
  form.categoryId.replaceChildren(
    ...categories.filter((c) => c.kind === kind).map((c) => h("option", { value: c.id }, c.name)),
    h("option", { value: "" }, "Ohne Kategorie"),
  );
  form.note.placeholder = `z. B. ${isExpense ? "Wocheneinkauf" : "Oktobergehalt"}`;
  form.querySelector("button[type=submit]").textContent = `${isExpense ? "Ausgabe" : "Einnahme"} speichern`;
}

async function submit(event, form) {
  event.preventDefault();
  const error = document.getElementById("form-error");
  const button = form.querySelector("button[type=submit]");
  showError(error, null);
  button.disabled = true;
  try {
    await api("/api/transactions", {
      method: "POST",
      body: {
        kind: form.kind.value,
        amount: form.amount.value,
        occurredOn: form.occurredOn.value,
        categoryId: form.categoryId.value || null,
        note: form.note.value,
      },
    });
    form.amount.value = "";
    form.note.value = "";
    form.amount.focus();
    await loadTransactions();
  } catch (e) {
    showError(error, e.message);
  } finally {
    button.disabled = false;
  }
}

async function loadTransactions() {
  const data = await api(`/api/transactions?month=${month}`);
  const tiles = [
    ["Einnahmen", data.incomeCents, "income"],
    ["Ausgaben", data.expenseCents, "expense"],
    ["Saldo", data.balanceCents, ""],
  ];
  document.getElementById("tiles").replaceChildren(
    ...tiles.map(([label, cents, kind]) => h("div", { class: `tile ${kind}` }, h("dt", {}, label), h("dd", {}, formatCents(cents)))),
  );

  document.getElementById("transactions").replaceChildren(
    data.transactions.length === 0
      ? h("p", { class: "muted" }, "In diesem Monat gibt es noch keine Transaktionen.")
      : h("ul", { class: "list" }, data.transactions.map(transactionItem)),
  );
}

function transactionItem(t) {
  const income = t.kind === "INCOME";
  return h(
    "li",
    { class: "list-item" },
    h(
      "div",
      { class: "stack", style: "gap: 0; min-width: 0" },
      h("span", { style: "font-weight: 500" }, t.categoryName ?? "Ohne Kategorie"),
      h("span", { class: "muted" }, formatDate(t.occurredOn) + (t.note ? ` · ${t.note}` : "")),
    ),
    h(
      "div",
      { style: "display: flex; align-items: center; gap: 16px" },
      h("span", { class: `amount ${income ? "income" : ""}` }, `${income ? "+" : "−"}${formatCents(t.amountCents)}`),
      h(
        "button",
        {
          type: "button",
          class: "btn-text danger",
          "aria-label": "Transaktion löschen",
          onclick: async () => {
            try {
              await api(`/api/transactions/${t.id}`, { method: "DELETE" });
              await loadTransactions();
            } catch (e) {
              showError(document.getElementById("load-error"), e.message);
            }
          },
        },
        "Löschen",
      ),
    ),
  );
}
