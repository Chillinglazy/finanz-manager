# Stack-Empfehlung und MVP-Plan

## Stack
- Next.js + TypeScript: Frontend und Backend in einem Projekt
- Supabase: Login/Accounts und Postgres-Datenbank; Row Level Security, damit jeder Nutzer nur seine eigenen Daten sieht
- Tailwind CSS fürs Design; Diagramme im Dashboard vorerst als einfache Tailwind-Balken ohne Zusatzpaket
- Hosting: Vercel + Supabase Free Tier

## MVP
1. Registrierung und Login (E-Mail und Passwort)
2. Kategorien anlegen und bearbeiten, mit Standard-Kategorien zum Start
3. Transaktionen: Einnahmen und Ausgaben mit Betrag, Datum, Kategorie, Notiz
4. Monatliche Budgets pro Kategorie
5. Dashboard: Ausgaben vs. Budget pro Kategorie, Monatssaldo, einfache Diagramme

## Ordnerstruktur
- `src/app` – Seiten und Routen (Next.js App Router)
- `src/components` – UI-Komponenten
- `src/lib` – Supabase-Client, Hilfsfunktionen
- `supabase/migrations` – Datenbankschema (SQL)
- `public` – statische Dateien
- `docs` – Planung und Dokumentation
