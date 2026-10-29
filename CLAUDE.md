# CLAUDE.md

Leitfaden für Claude bei der Arbeit an diesem Projekt.

## Projekt
Finanz-Tracking-Web-App: Web-App zur Verwaltung persönlicher Finanzen. Mehrere Nutzer, jeder mit eigenem Account und eigenen Daten.
Kernfunktionen: Kategorien, Transaktionen (Einnahmen/Ausgaben), monatliche Budgets pro Kategorie, Dashboard.
Details zum MVP: [docs/plan.md](docs/plan.md).

## Stack
- Next.js 15 (App Router, React 19) + TypeScript (strict)
- Supabase: Auth (E-Mail/Passwort) und Postgres
- Tailwind CSS 4
- Hosting: Vercel + Supabase

## Ordnerstruktur
- `src/app` – Seiten, Layouts, Route Handler, Server Actions
- `src/components` – wiederverwendbare UI-Komponenten
- `src/lib` – Typen, Hilfsfunktionen
- `src/lib/supabase` – Supabase-Clients: `client.ts` (Browser), `server.ts` (Server Components/Actions), `middleware.ts` (Session-Refresh)
- `src/middleware.ts` – Next.js-Middleware, erneuert die Auth-Session
- `supabase/migrations` – SQL-Migrationen, eine Datei pro Änderung, mit Zeitstempel im Namen
- `public` – statische Dateien
- `docs` – Planung und Dokumentation

## Konventionen
- Sicherheit: Jede Tabelle mit Nutzerdaten hat eine `user_id`-Spalte und Row Level Security (`user_id = auth.uid()`). Nie RLS deaktivieren, nie den Service-Role-Key im Client verwenden.
- Geldbeträge als Ganzzahl in Cent speichern (`bigint`), nie als Float. Anzeige mit `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`.
- Datum als `date` bzw. `timestamptz` speichern; Budgets beziehen sich auf einen Monat (erster Tag des Monats).
- Datenzugriff bevorzugt in Server Components und Server Actions.
- Komponenten in PascalCase, Dateien für Hilfsfunktionen in camelCase.
- UI-Texte auf Deutsch, Code und Bezeichner auf Englisch.
- Secrets nur in `.env.local` (nicht committen); Vorlage in `.env.example` pflegen.

## Befehle
- `npm run dev` – Entwicklungsserver auf http://localhost:3000
- `npm run build` – Produktions-Build (vor jedem Commit prüfen)
- `npm run lint` – ESLint
- Schema-Änderungen: neue Datei in `supabase/migrations/`, im Supabase SQL-Editor ausführen

## Workflow
- README.md und CLAUDE.md nach jedem abgeschlossenen Schritt aktualisieren (Abschnitt „Fortschritt“ in beiden Dateien, Datum anpassen).
- Vor Push oder Pull Request beim Nutzer nachfragen.
- Kleine, thematisch abgegrenzte Commits.

## Fortschritt

Stand: 2026-10-29

- [x] Stack-Empfehlung und MVP-Plan (`docs/plan.md`)
- [x] Ordnerstruktur und CLAUDE.md angelegt
- [x] GitHub-Repo angelegt und verbunden
- [x] Next.js-Projekt aufgesetzt (TypeScript, Tailwind, Supabase-Clients, Middleware)
- [x] Datenbankschema mit Row Level Security und Standard-Kategorien
- [ ] Registrierung und Login
- [ ] Kategorien
- [ ] Transaktionen
- [ ] Monatliche Budgets pro Kategorie
- [ ] Dashboard
