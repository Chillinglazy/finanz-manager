# CLAUDE.md

Leitfaden für Claude bei der Arbeit an diesem Projekt.

## Projekt
Finanz-Tracking-Web-App: Web-App zur Verwaltung persönlicher Finanzen. Mehrere Nutzer, jeder mit eigenem Account und eigenen Daten.
Kernfunktionen: Kategorien, Transaktionen (Einnahmen/Ausgaben), monatliche Budgets pro Kategorie, Dashboard.
Details zum MVP: [docs/plan.md](docs/plan.md).

## Stack
- Backend: Java 21, Spring Boot 4 (Web MVC, Security, Data JPA, Flyway), Maven (`./mvnw`)
- Datenbank: PostgreSQL (lokal per `docker compose`), Tests mit H2 im PostgreSQL-Modus
- Frontend: reines HTML, CSS und JavaScript ohne Framework und ohne Build-Schritt
- Hosting: offen (Java-fähig, z. B. Render oder Railway)

## Ordnerstruktur
- `src/main/java/de/finanzmanager/` – Backend, ein Paket pro Bereich:
  - `user/` – `AppUser`, Login/Registrierung (`AuthController`), `AppUserPrincipal` (per `@AuthenticationPrincipal` in Controllern)
  - `category/`, `transaction/`, `budget/` – jeweils Entity, Repository, Service, Controller
  - `budget/BudgetService.overview` – Budgets und Ausgaben pro Kategorie für einen Monat (auch fürs Dashboard)
  - `dashboard/` – Monatsübersicht
  - `config/SecurityConfig.java` – Session-Login, CSRF per Cookie `XSRF-TOKEN`, `/api/**` braucht Anmeldung, 401 statt Redirect
  - `config/WebConfig.java` – schöne URLs (`/dashboard` → `dashboard.html`); neue Seiten dort eintragen
  - `common/` – `ApiException` (Fehler mit deutscher Meldung → JSON `{"error": ...}`), `Money` (Euro-Text → Cent), `Months` (`YYYY-MM`)
- `src/main/resources/static/` – Frontend: eine HTML-Datei pro Seite, `js/common.js` (API-Aufrufe, `currentUser`, `icon`, `formatCents`, Monate, Kopfzeile, `budgetBar`), ein Skript pro Seite, `css/style.css`
- `src/main/resources/db/migration/` – Flyway-Migrationen (`V2__beschreibung.sql` usw.), nie bestehende Dateien ändern
- `src/main/resources/application.properties` – Konfiguration, DB über `DB_URL`, `DB_USER`, `DB_PASSWORD`
- `src/test/` – JUnit-Tests (`ApiIntegrationTest` mit MockMvc)
- `docs/` – Planung und Dokumentation

## Konventionen
- Sicherheit: Jede Tabelle mit Nutzerdaten hat eine `user_id`. Jede Abfrage im Service filtert auf den angemeldeten Nutzer (`findByIdAndUserId` usw.); fremde IDs ergeben 404. Nie Daten ohne `userId` laden.
- Geldbeträge als Ganzzahl in Cent (`long` / `bigint`), nie als `double`. Eingaben als Text („12,50“) an die API, Umrechnung mit `Money.parseEuroToCents`. Anzeige im Frontend mit `formatCents` (`Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`).
- Datum als `LocalDate` / `date`; Budgets beziehen sich auf einen Monat (erster Tag des Monats). Monate in der API als `?month=YYYY-MM`, in Seiten-URLs als `?monat=YYYY-MM`.
- Frontend: DOM nur über `h(...)` aus `common.js` bauen (kein `innerHTML` mit Nutzerdaten), API nur über `api(...)` (setzt CSRF-Header, leitet bei 401 zum Login).
- Klassen in PascalCase, ein Paket pro Fachbereich, Konstruktor-Injection.
- UI-Texte und Fehlermeldungen auf Deutsch, Code und Bezeichner auf Englisch.
- Secrets nur als Umgebungsvariablen (nicht committen); Vorlage in `.env.example` pflegen.

## Befehle
- `docker compose up -d` – PostgreSQL starten
- `./mvnw spring-boot:run` – App auf http://localhost:8080
- `./mvnw test` – Tests (vor jedem Commit)
- `./mvnw package` – Build (vor jedem Commit prüfen)
- Schema-Änderungen: neue Datei `src/main/resources/db/migration/V<n>__<name>.sql`, läuft beim Start automatisch

## Workflow
- README.md und CLAUDE.md nach jedem abgeschlossenen Schritt aktualisieren (Abschnitt „Fortschritt“ in beiden Dateien, Datum anpassen).
- Pull Requests ohne Rückfrage öffnen und pushen, sobald `./mvnw test` und `./mvnw package` fehlerfrei sind (Feature-Branch → PR, nie direkt auf `main`).
- Kleine, thematisch abgegrenzte Commits.

## Fortschritt

Stand: 2026-11-05

- [x] Stack-Empfehlung und MVP-Plan (`docs/plan.md`)
- [x] Ordnerstruktur und CLAUDE.md angelegt
- [x] GitHub-Repo angelegt und verbunden
- [x] MVP in Next.js + Supabase gebaut (Login, Kategorien, Transaktionen, Budgets, Dashboard, Landingpage)
- [x] Umstellung auf Java: Spring-Boot-Backend mit REST-API, eigenem Login (Spring Security) und Flyway-Schema
- [x] Frontend in HTML/CSS/JS nachgebaut (alle Seiten wie vorher)
- [x] Tests (JUnit + MockMvc), lokal mit PostgreSQL 16 durchgeklickt
- [x] Navigation nach dem Login: Logo führt zur Startseite, Startseite zeigt angemeldet „Zum Dashboard“, Login/Registrieren leiten Angemeldete zum Dashboard weiter
- [x] Lokal mit Docker starten (Docker Desktop + WSL2 unter Windows eingerichtet, App läuft auf http://localhost:8080)
- [x] Symbole in der Navigation (📊 Dashboard, 💸 Transaktionen, 🎯 Budgets, 🏷️ Kategorien, 🏠 Startseite, 🚪 Abmelden)
- [ ] Deployment (z. B. Render oder Railway, Datenbank z. B. Supabase-Postgres)
