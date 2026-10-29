# Finanz-Tracking-Web-App

Web-App zur Verwaltung persönlicher Finanzen, für beliebig viele Nutzer mit eigenem Account.

Stack: Next.js + TypeScript, Supabase (Auth + Postgres mit Row Level Security), Tailwind CSS.

Siehe [docs/plan.md](docs/plan.md) für Stack-Empfehlung und MVP-Plan.

## Lokal starten

1. Node.js 20+ installieren
2. Ein Projekt auf [supabase.com](https://supabase.com) anlegen
3. Im Supabase SQL-Editor `supabase/migrations/20261029000000_initial_schema.sql` ausführen
4. `.env.example` nach `.env.local` kopieren und URL + Anon-Key aus Supabase (Settings > API) eintragen
5. In Supabase unter Authentication > URL Configuration `http://localhost:3000/auth/confirm` als Redirect-URL eintragen
6. `npm install` und `npm run dev`, dann http://localhost:3000 öffnen

## Fortschritt

Stand: 2026-10-29

- [x] Stack-Empfehlung und MVP-Plan (`docs/plan.md`)
- [x] Ordnerstruktur und CLAUDE.md angelegt
- [x] GitHub-Repo angelegt und verbunden
- [x] Next.js-Projekt aufgesetzt (TypeScript, Tailwind, Supabase-Clients, Middleware)
- [x] Datenbankschema mit Row Level Security und Standard-Kategorien
- [x] Registrierung und Login (`/registrieren`, `/login`, geschützte Seiten über Middleware)
- [x] Kategorien (`/kategorien`: anlegen, umbenennen, löschen)
- [x] Transaktionen (`/transaktionen`: erfassen, löschen, Monatsübersicht mit Saldo)
- [x] Monatliche Budgets pro Kategorie (`/budgets`: Betrag pro Kategorie, Fortschrittsbalken, Vormonat übernehmen)
- [x] Dashboard (`/dashboard`: Monatssummen, Budget-Status mit Warnung, Ausgaben nach Kategorie)
- [x] Landingpage (`/`: Hero mit Dashboard-Vorschau, Funktionen, Footer)
- [ ] Supabase-Projekt anlegen und alles mit echten Daten testen
- [ ] Deployment auf Vercel
