# Stack und MVP-Plan

## Stack (seit 2026-10-31)
- Backend: Java 21 + Spring Boot 4 mit REST-API unter `/api`
- Login: E-Mail und Passwort über Spring Security (Session-Cookie, Passwörter mit BCrypt, CSRF-Schutz)
- Datenbank: PostgreSQL, Zugriff über Spring Data JPA, Schema über Flyway-Migrationen; jeder Nutzer sieht nur seine eigenen Daten (Filter auf `user_id` in jedem Service)
- Frontend: reines HTML, CSS und JavaScript, von Spring Boot ausgeliefert (`src/main/resources/static`)
- Lokal: PostgreSQL per `docker compose`; Tests mit JUnit und H2
- Hosting: Java-fähiger Anbieter (z. B. Render oder Railway), Datenbank z. B. Supabase-Postgres oder Postgres des Anbieters

Vorher (bis 2026-10-31): Next.js + TypeScript + Supabase + Tailwind, steht noch in der Git-Historie.

## MVP
1. Registrierung und Login (E-Mail und Passwort)
2. Kategorien anlegen und bearbeiten, mit Standard-Kategorien zum Start
3. Transaktionen: Einnahmen und Ausgaben mit Betrag, Datum, Kategorie, Notiz
4. Monatliche Budgets pro Kategorie
5. Dashboard: Ausgaben vs. Budget pro Kategorie, Monatssaldo, einfache Diagramme

## Ordnerstruktur
- `src/main/java/de/finanzmanager` – Backend, ein Paket pro Bereich (`user`, `category`, `transaction`, `budget`, `dashboard`, `config`, `common`)
- `src/main/resources/static` – Frontend (HTML, `css/`, `js/`)
- `src/main/resources/db/migration` – Datenbankschema (Flyway)
- `src/test` – Tests
- `docs` – Planung und Dokumentation
