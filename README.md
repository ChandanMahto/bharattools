# BharatTools 🇮🇳

Indian-first, browser-first utility platform. Guest calculations run locally in the browser. Accounts and cloud-saved calculations are optional and are intentionally not part of the guest flow.

## What's included in this first implementation

- Angular standalone application with SSR entry points and SEO metadata.
- Calm responsive homepage and searchable tool catalogue.
- Working GST calculator: inclusive/exclusive amounts, CGST+SGST or IGST, configurable rate.
- Working EMI calculator: monthly reducing-balance formula and principal/interest breakdown.
- Working percentage calculator.
- Indian number/currency formatting (`en-IN`, INR).
- Spring Boot API with optional email/password registration and sign-in (BCrypt password hashes, short-lived JWT access token).
- Explicit saved-calculation flow for GST, EMI and percentage tools: list, rename and delete your own saved items.
- PostgreSQL persistence for accounts and saved calculations; guest calculator code does not call this API.
- PostgreSQL Docker Compose service and Flyway schema migration.
- No analytics, cookies, account prompts, or network calls in guest calculator logic.

This is a foundation, not yet a complete clone of every category. Tax rates and rules are configurable and must be reviewed against current official notifications before production financial use.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Java 21
- Maven 3.9+
- Docker Desktop (optional; only needed for PostgreSQL)

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200.

Production build:

```bash
npm run build
```

The app is configured with Angular SSR entry points. Verify the generated server output with your deployment adapter before deploying behind a reverse proxy.

## Optional accounts and saved calculations

- Guests can use every calculator without signing in. Inputs stay in component memory and the calculator pages make no API request unless the user explicitly presses **Save calculation**.
- To save, create an account or sign in at `/account`. The access token is kept in `sessionStorage` for the current browser tab session; it is not written to localStorage or cookies. Signing out clears it.
- Account passwords are stored as BCrypt hashes. Saved-calculation endpoints require a signed JWT and every read/update/delete is scoped to the authenticated user ID.
- The feature is optional. If the API/database is unavailable, guest calculations still work; saving and account screens will show an error.

## Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API listens on http://localhost:8080. Frontend API URL is configured in `frontend/src/app/core/environment.ts`.

### Backend environment variables

| Variable | Local default | Production guidance |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/bharattools` | Use your managed PostgreSQL connection string and TLS settings. |
| `DB_USERNAME` | `bharattools` | Use a dedicated least-privilege database user. |
| `DB_PASSWORD` | `local_dev_change_me` | Supply a strong secret via your deployment secret manager. |
| `JWT_SECRET` | Local development placeholder | **Required in production:** generate a cryptographically random secret of at least 32 bytes. Never commit it. |
| `JWT_EXPIRATION_HOURS` | `12` | Keep access-token lifetime short; choose a value appropriate to your security policy. |
| `FRONTEND_ORIGIN` | `http://localhost:4200` | Set to the exact HTTPS frontend origin; CORS is not a substitute for authentication. |
| `PORT` | `8080` | Set according to your hosting platform. |

Before production, replace `apiBaseUrl` in `frontend/src/app/core/environment.ts` with the HTTPS API URL, configure HTTPS at the edge, set all secrets outside source control, and test account registration/login plus cross-account access isolation. Do not use the local defaults in production.

Health endpoint: http://localhost:8080/api/health

## Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

Database defaults are for local development only. Change all credentials before deployment.

## Privacy contract

- Guest calculation inputs are held in component memory only.
- The calculation modules are pure TypeScript and do not call the API.
- No guest history is persisted to localStorage, IndexedDB, cookies, or the backend.
- Do not add session replay or analytics that capture calculator inputs.
- If a future tool requires a remote service (for example, AI background removal), disclose that clearly before upload.
- Signed-in saving must be an explicit user action, protected by authentication and ownership checks.

## Indian calculation notes

- GST: user selects a rate. The app does not assume a universal GST rate. Intra-state tax is split equally into CGST/SGST; inter-state tax is represented as IGST.
- EMI: monthly reducing-balance calculation, with rate entered as annual nominal percentage.
- Currency formatting: Indian grouping and INR display.
- Income tax, EPF, gratuity, HRA, TDS and state electricity tariffs are deliberately not approximated in this starter. Add them only with financial-year/rule versioning, source references and reviewed tests.

## Project structure

```text
bharattools/
├── frontend/              # Angular SSR application
│   └── src/app/
│       ├── core/           # Indian formatting and tool registry
│       ├── tools/          # Pure calculation modules
│       ├── pages/          # Home and calculator pages
│       └── shared/         # Shared layout
├── backend/               # Spring Boot API
├── database/              # PostgreSQL schema
├── docker-compose.yml
└── README.md
```

## Next milestones

1. Add unit tests and Playwright coverage for every tool.
2. Harden and integration-test the optional account registration/login and saved-calculation feature (now implemented as an initial version).
3. Add financial-year versioned income-tax and payroll calculators.
4. Add document/image tools using local browser APIs and Web Workers.
5. Add category landing pages, sitemap generation, canonical URLs and structured data.
6. Add CI, security review, accessibility checks and production deployment configuration.
