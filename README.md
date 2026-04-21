# Math Operations API - Playwright E2E Tests

End-to-end tests for the Math Operations API using [Playwright](https://playwright.dev/), automated via GitHub Actions.

## API Under Test

- **Base URL:** `https://doctrine-amiable-movie.ngrok-free.dev`
- **Endpoint:** `POST /add`
- **Purpose:** Adds two integers `a` and `b` and returns `{ result: a + b }`

## Project Structure

```
.
├── .github/workflows/playwright.yml   # GitHub Actions CI pipeline
├── tests/
│   └── add.spec.ts                    # API tests for POST /add
├── playwright.config.ts               # Playwright configuration
├── package.json
└── .gitignore
```

## Local Setup

### Prerequisites
- Node.js 20+
- npm

### Install

```bash
npm install
npx playwright install --with-deps chromium
```

### Run tests

```bash
# Run all tests
npm test

# Run with the HTML reporter opened
npm test && npx playwright show-report

# Run against a different base URL
API_BASE_URL=https://staging.example.com npm test

# Debug mode
npm run test:debug
```

## What's Tested

The suite covers the full `POST /add` contract with three categories of tests:

**Happy path (~7 tests)** — positive, negative, zero, mixed-sign, and large integer additions, plus a commutativity check (`a + b == b + a`).

**Parameterized cases (~5 tests)** — data-driven tests over a table of inputs/expected outputs.

**Invalid input / 400 errors (~7 tests)** — string values, missing `a`, missing `b`, empty body, `null` values, and malformed JSON.

**Response contract & performance (~3 tests)** — verifies `result` is an integer, `Content-Type: application/json`, and that responses return under 5 seconds.

## GitHub Actions Pipeline

The workflow at `.github/workflows/playwright.yml` runs automatically on:

- Every `push` to `main`, `master`, or `develop`
- Every pull request targeting those branches
- Manual trigger via the Actions tab (with optional base URL override)
- Nightly at 02:00 UTC

Artifacts uploaded after each run:
- `playwright-report` — HTML test report (30-day retention)
- `test-results` — JUnit XML and failure traces (30-day retention)

### Configuring the API base URL in CI

You have three options, in order of precedence:

1. **Workflow dispatch input** — when running manually, enter a URL in the `api_base_url` field.
2. **Repository variable** — go to **Settings → Secrets and variables → Actions → Variables** and add a variable named `API_BASE_URL`.
3. **Default** — falls back to `https://doctrine-amiable-movie.ngrok-free.dev` (defined in the workflow file).

## Notes on the ngrok-free Tunnel

The default base URL is an `ngrok-free.dev` tunnel. Two things to be aware of:

1. These URLs are **ephemeral** — if the tunnel restarts, the URL changes and tests will fail with DNS errors. Update `API_BASE_URL` accordingly.
2. The config sends an `ngrok-skip-browser-warning: true` header on every request to bypass ngrok's HTML interstitial page, which would otherwise break JSON parsing.

For production use, host the API on a stable domain and update `playwright.config.ts` or the `API_BASE_URL` variable.

## Extending the Tests

To add tests for new endpoints, create a new file under `tests/` ending in `.spec.ts`. Playwright's `request` fixture (see existing tests) is the standard way to make API calls — no browser is launched, so tests run fast.
