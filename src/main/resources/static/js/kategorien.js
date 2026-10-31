"use strict";

document.addEventListener("DOMContentLoaded", load);

async function load() {
  let categories;
  try {
    categories = await api("/api/categories");
  } catch (e) {
    showError(document.getElementById("load-error"), "Kategorien konnten nicht geladen werden.");
    return;
  }
  for (const section of document.querySelectorAll("section[data-kind]")) {
    const kind = section.dataset.kind;
    const items = categories.filter((c) => c.kind === kind);
    section.querySelector(".category-list").replaceChildren(
      items.length === 0
        ? h("p", { class: "muted" }, "Noch keine Kategorien.")
        : h("ul", { class: "list" }, items.map(categoryRow)),
      newCategoryForm(kind),
    );
  }
}

function newCategoryForm(kind) {
  const error = h("p", { class: "error hidden", role: "alert" });
  const input = h("input", { class: "input", name: "name", placeholder: "Neue Kategorie", maxlength: 50, required: true, style: "flex: 1" });
  return h(
    "form",
    {
      class: "stack",
      style: "gap: 4px; margin-top: 12px",
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          await api("/api/categories", { method: "POST", body: { name: input.value, kind } });
          await load();
        } catch (e) {
          showError(error, e.message);
        }
      },
    },
    h("div", { style: "display: flex; gap: 8px" }, input, h("button", { type: "submit", class: "btn btn-primary" }, "Hinzufügen")),
    error,
  );
}

function categoryRow(category) {
  const li = h("li", {});
  showView();
  return li;

  function showView() {
    li.replaceChildren(
      h(
        "div",
        { class: "list-item" },
        h("span", {}, category.name),
        h(
          "div",
          { style: "display: flex; gap: 12px" },
          h("button", { type: "button", class: "btn-text", onclick: showEdit }, "Umbenennen"),
          h(
            "button",
            {
              type: "button",
              class: "btn-text danger",
              onclick: async () => {
                if (!window.confirm(`Kategorie „${category.name}“ löschen? Zugehörige Budgets werden ebenfalls gelöscht.`)) return;
                try {
                  await api(`/api/categories/${category.id}`, { method: "DELETE" });
                  await load();
                } catch (e) {
                  showError(document.getElementById("load-error"), e.message);
                }
              },
            },
            "Löschen",
          ),
        ),
      ),
    );
  }

  function showEdit() {
    const error = h("p", { class: "error hidden", role: "alert" });
    const input = h("input", { class: "input", value: category.name, maxlength: 50, required: true, style: "flex: 1" });
    li.replaceChildren(
      h(
        "form",
        {
          style: "display: flex; gap: 8px; align-items: center",
          onsubmit: async (event) => {
            event.preventDefault();
            try {
              await api(`/api/categories/${category.id}`, { method: "PUT", body: { name: input.value } });
              await load();
            } catch (e) {
              showError(error, e.message);
            }
          },
        },
        input,
        h("button", { type: "submit", class: "btn-text accent" }, "Speichern"),
        h("button", { type: "button", class: "btn-text", onclick: showView }, "Abbrechen"),
      ),
      error,
    );
    input.focus();
  }
}
