# ColiFlow

> The first peer-to-peer (P2P) delivery platform for Morocco — connecting **senders** who need to ship a package with **travelers** who have free space on a trip they're already making.

ColiFlow is a full-stack web application with a multilingual interface (Français, English, العربية), live package tracking, an integrated chat, secure escrow-style payments, and a complete admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), Tailwind CSS v4, shadcn/ui + HeroUI, Framer Motion / GSAP, i18next |
| **Backend** | Laravel 12 (PHP 8.2), Sanctum auth, Eloquent ORM |
| **Database** | MySQL (production), in-memory SQLite (tests) |
| **Testing** | PHPUnit (backend) · Vitest + React Testing Library (frontend) |

---

## Getting Started

```bash
# Install dependencies
cd client && npm install
cd ../server && composer install

# Run BOTH frontend + backend with a single command (from the project root)
npm install      # installs the root dev tooling (concurrently)
npm run dev
```

- Frontend (Vite): http://localhost:3000
- Backend (Laravel): http://localhost:8000

---

## ✅ Testing

ColiFlow ships with an **automated test suite covering both the API and the UI** — run before every deployment to guarantee the core features keep working.

> 📄 **A ready-to-present report (with screenshots of the passing suites) is available at
> [`docs/test-report/ColiFlow-Test-Report.pdf`](docs/test-report/ColiFlow-Test-Report.pdf).**

### Run everything with one command

```bash
# From the project root — runs the frontend and backend suites side by side
npm test
```

Or run each layer on its own:

```bash
npm run test:server   # Laravel  →  php artisan test
npm run test:client   # React    →  vitest run
```

### Test strategy

| Layer | Tool | What it verifies | Tests |
|-------|------|------------------|:-----:|
| **API / Feature** | Laravel PHPUnit | Real endpoints: packages, travels, admin access, authentication | 28 |
| **Unit** | Laravel PHPUnit | Model business logic (platform settings) | 4 |
| **Component / Unit** | Vitest + Testing Library | UI components, class merger, i18n FR/EN/AR key parity | 9 |
| | | **Total** | **41 ✓** |

### What the backend tests cover

- **Packages** — creating a package (with image upload), required-field validation, the "departure ≠ arrival city" rule, a user only seeing their own packages, and ownership authorization on delete.
- **Travels** — only a **verified traveler** can publish a trip, validation rules, the public listing, and the "featured = max 4" rule.
- **Admin** — guests and regular users are blocked from the admin area; only an admin gets through.
- **Auth** — registration, login, logout, email verification and password reset.

### What the frontend tests cover

- **i18n parity** — every translation key exists in **both** English and Arabic (catches missing translations).
- **`cn()` class merger** — Tailwind class merging / conflict resolution.
- **Component rendering** — a UI component renders its props correctly (React Testing Library).

### Bugs found & fixed *through* testing

Writing the tests surfaced real **database-portability bugs** (the app previously only worked on MySQL):

1. **MySQL-only migration** — a migration used `ALTER TABLE … MODIFY … ENUM`; guarded it to MySQL/MariaDB so the schema builds on any database.
2. **MySQL-only query** — the package dashboard used the `YEARWEEK()` function; rewrote the weekly stats in PHP (portable, and one fewer query).
3. **Stale auth tests** — 5 scaffolded tests no longer matched the customised auth flow; updated them to the real contract.

These fixes are *why* the suite can run on a fast in-memory SQLite database with zero setup.

---

## Project Structure

```
ColiFlow/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── components/home/ # Landing page sections
│   │   ├── ui/             # Reusable UI components (+ *.test.jsx)
│   │   └── lib/            # Utilities (+ *.test.js)
│   └── public/locales/     # i18n: fr / en / ar
├── server/                 # Laravel backend
│   ├── app/Http/Controllers/
│   ├── database/factories/ # Model factories for tests
│   └── tests/              # Feature + Unit tests
└── docs/test-report/       # Generated test report (HTML + PDF)
```
