// Gemeinsame Hilfsfunktionen für alle Seiten: API-Aufrufe, Geld- und Monatsformat, Kopfzeile.
"use strict";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

function formatCents(cents) {
  return euro.format(cents / 100);
}

/** Cent als Eingabetext, z. B. 1250 -> "12,50". */
function centsToInput(cents) {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

// ---------- Monate als "YYYY-MM", in der URL als ?monat=YYYY-MM ----------

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthFromUrl() {
  const value = new URLSearchParams(location.search).get("monat");
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : currentMonth();
}

function shiftMonth(month, delta) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month) {
  const [year, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(year, m - 1, 1));
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

// ---------- DOM ----------

/** Erzeugt ein Element: h("p", { class: "muted" }, "Text", kind1, ...). Text wird nie als HTML interpretiert. */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else if (key === "style") el.style.cssText = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

// ---------- API ----------

function readCookie(name) {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Ruft die Java-API auf. Wirft einen Error mit deutscher Meldung; leitet bei 401 zum Login um. */
async function api(path, { method = "GET", body, redirectOn401 = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const csrf = readCookie("XSRF-TOKEN");
  if (csrf && method !== "GET") headers["X-XSRF-TOKEN"] = csrf;

  const response = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && redirectOn401) {
    location.href = "/login";
    throw new Error("Bitte melde dich an.");
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const fallback = response.status === 403 ? "Sitzung abgelaufen. Bitte lade die Seite neu." : "Etwas ist schiefgelaufen.";
    throw new Error(data?.error ?? fallback);
  }
  return data;
}

/** Angemeldeter Nutzer ({ email }) oder null, ohne Weiterleitung zum Login. */
async function currentUser() {
  try {
    return await api("/api/auth/me", { redirectOn401: false });
  } catch {
    return null;
  }
}

// ---------- Bausteine ----------

const NAV_LINKS = [
  ["/dashboard", "📊", "Dashboard"],
  ["/transaktionen", "💸", "Transaktionen"],
  ["/budgets", "🎯", "Budgets"],
  ["/kategorien", "🏷️", "Kategorien"],
];

/** Symbol vor einem Link- oder Buttontext (für Screenreader ausgeblendet). */
function icon(symbol) {
  return h("span", { class: "icon", "aria-hidden": "true" }, symbol);
}

/** Füllt <header id="app-header"> mit Logo (Link zur Startseite), Navigation und Abmelden-Button. */
function renderAppHeader() {
  const header = document.getElementById("app-header");
  if (!header) return;
  header.className = "app-header";
  const path = location.pathname.replace(/\.html$/, "");
  header.replaceChildren(
    h("a", { href: "/", class: "brand", style: "text-decoration: none", title: "Zur Startseite" }, h("span", {}, "€"), " Finanz-Manager"),
    h(
      "nav",
      { "aria-label": "Hauptnavigation" },
      NAV_LINKS.map(([href, symbol, label]) =>
        h("a", { href, class: path === href ? "active" : null }, icon(symbol), label),
      ),
    ),
    h(
      "button",
      {
        type: "button",
        class: "btn-text",
        style: "text-decoration: underline",
        onclick: async () => {
          await api("/api/auth/logout", { method: "POST", redirectOn401: false }).catch(() => {});
          location.href = "/login";
        },
      },
      icon("🚪"),
      "Abmelden",
    ),
  );
}

/** Monatsauswahl mit Pfeilen; verlinkt auf basePath?monat=YYYY-MM. */
function monthSwitcher(month, basePath) {
  return h(
    "div",
    { class: "month-switcher" },
    h("a", { href: `${basePath}?monat=${shiftMonth(month, -1)}`, "aria-label": "Vorheriger Monat" }, "←"),
    h("span", {}, formatMonth(month)),
    h("a", { href: `${basePath}?monat=${shiftMonth(month, 1)}`, "aria-label": "Nächster Monat" }, "→"),
  );
}

/** Fortschrittsbalken „ausgegeben von Budget“; ab 80 % gelb, über 100 % rot. */
function budgetBar(budgetCents, spentCents) {
  const ratio = budgetCents > 0 ? spentCents / budgetCents : spentCents > 0 ? 2 : 0;
  const state = ratio > 1 ? "over" : ratio >= 0.8 ? "warn" : "";
  const remaining = budgetCents - spentCents;
  const percent = Math.min(ratio, 1) * 100;
  return h(
    "div",
    {},
    h(
      "div",
      { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(percent) },
      h("div", { class: state, style: `width: ${percent}%` }),
    ),
    h(
      "div",
      { class: "bar-caption" },
      h("span", {}, `${formatCents(spentCents)} von ${formatCents(budgetCents)}`),
      h(
        "span",
        { class: remaining < 0 ? "over" : null },
        remaining < 0 ? `${formatCents(-remaining)} drüber` : `${formatCents(remaining)} übrig`,
      ),
    ),
  );
}

function showError(element, message) {
  element.textContent = message ?? "";
  element.classList.toggle("hidden", !message);
}

document.addEventListener("DOMContentLoaded", renderAppHeader);
