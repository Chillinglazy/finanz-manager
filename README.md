# Finanz-Tracking-Web-App

Web-App zur Verwaltung persönlicher Finanzen, für beliebig viele Nutzer mit eigenem Account.

Stack: Java 21 + Spring Boot 4 (REST-API, Spring Security, Spring Data JPA, Flyway), PostgreSQL, Frontend in reinem HTML, CSS und JavaScript.

Siehe [docs/plan.md](docs/plan.md) für Stack und MVP-Plan.

## Lokal starten

1. Java 21 oder neuer (JDK) und Docker installieren (Windows: Docker Desktop braucht WSL2 und die Windows-Komponente „Windows-Subsystem für Linux“)
2. Datenbank starten: `docker compose up -d` (PostgreSQL 16 auf Port 5432)
3. App starten: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
4. http://localhost:8080 öffnen und registrieren

Das Datenbankschema legt Flyway beim Start automatisch an (`src/main/resources/db/migration`).
Eine andere Datenbank (z. B. Supabase-Postgres) über die Umgebungsvariablen `DB_URL`, `DB_USER` und `DB_PASSWORD` einstellen, siehe `.env.example`.

## Befehle

- `./mvnw spring-boot:run` – App starten (http://localhost:8080)
- `./mvnw test` – Tests (laufen mit einer H2-In-Memory-Datenbank, ohne Docker)
- `./mvnw package` – ausführbares JAR in `target/` bauen, starten mit `java -jar target/finanz-manager-0.1.0.jar`

## REST-API

Alle Endpunkte unter `/api` außer Login und Registrierung brauchen eine Anmeldung (Session-Cookie). Schreibende Requests brauchen den Header `X-XSRF-TOKEN` mit dem Wert des Cookies `XSRF-TOKEN`.

| Methode | Pfad | Zweck |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Registrieren bzw. anmelden (`{email, password}`) |
| POST | `/api/auth/logout` | Abmelden |
| GET | `/api/auth/me` | Angemeldeter Nutzer |
| GET, POST | `/api/categories` | Kategorien auflisten bzw. anlegen (`{name, kind}`) |
| PUT, DELETE | `/api/categories/{id}` | Umbenennen bzw. löschen |
| GET | `/api/transactions?month=YYYY-MM` | Transaktionen und Summen eines Monats |
| POST, DELETE | `/api/transactions`, `/api/transactions/{id}` | Transaktion erfassen bzw. löschen |
| GET, PUT | `/api/budgets?month=YYYY-MM`, `/api/budgets` | Budgets eines Monats bzw. Budget setzen (leerer Betrag entfernt es) |
| POST | `/api/budgets/copy-previous?month=YYYY-MM` | Budgets aus dem Vormonat übernehmen |
| GET | `/api/dashboard?month=YYYY-MM` | Monatsübersicht fürs Dashboard |

## Fortschritt

Stand: 2026-11-05

- [x] Stack-Empfehlung und MVP-Plan (`docs/plan.md`)
- [x] Ordnerstruktur und CLAUDE.md angelegt
- [x] GitHub-Repo angelegt und verbunden
- [x] MVP in Next.js + Supabase gebaut (Login, Kategorien, Transaktionen, Budgets, Dashboard, Landingpage)
- [x] Umstellung auf Java: Spring-Boot-Backend mit REST-API, eigenem Login (Spring Security) und Flyway-Schema
- [x] Frontend in HTML/CSS/JS nachgebaut (alle Seiten wie vorher)
- [x] Tests (JUnit + MockMvc), lokal mit PostgreSQL 16 durchgeklickt
- [x] Lokal mit Docker starten (Docker Desktop + WSL2 unter Windows eingerichtet, App läuft auf http://localhost:8080)
- [ ] Deployment (z. B. Render oder Railway, Datenbank z. B. Supabase-Postgres)
