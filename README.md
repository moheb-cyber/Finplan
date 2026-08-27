# FinPlan

A personal finance decision and planning platform focused on turning everyday financial data into clear, practical insights.

## Version 1

FinPlan v1 provides authenticated personal finance tracking with real backend persistence, transaction and budget CRUD, dashboard summaries, analytics, settings, bilingual UI, and currency display preferences.

## Features

- Secure account registration and sign-in
- Signed, expiring token authentication with environment-based secret configuration
- Salted PBKDF2-HMAC-SHA256 password hashing
- User-scoped transaction and budget data
- Create, update, delete and filter transactions
- Create, update and delete monthly budgets
- Duplicate-budget protection per user, category and month
- Dashboard income, expenses, balance and budget usage
- Spending-by-category and transaction summaries
- English and Persian UI
- USD and IRR display preferences
- Month navigation
- Persistent SQLite storage for local development
- Automated backend tests in GitHub Actions

## Tech Stack

- HTML / CSS / JavaScript
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pytest
- GitHub Actions

## Project Structure

```text
Finplan/
├── backend/
│   ├── auth.py
│   ├── auth_models.py
│   ├── auth_router.py
│   ├── auth_store.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── tests/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── polish.css
│   ├── v1-ui.css
│   ├── final-v1.css
│   ├── v1-crud.css
│   ├── phase2-polish.css
│   ├── auth.css
│   ├── script.js
│   ├── final-v1.js
│   ├── transactions-view.js
│   ├── transaction-submit-fix.js
│   ├── v1-crud.js
│   ├── settings-v1.js
│   └── auth-ui.js
├── data/
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

Local runtime data such as `.env` and SQLite databases are intentionally excluded from version control.

## Run Locally

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and replace `FINPLAN_AUTH_SECRET` with a long random secret.

Optional variables:

```text
FINPLAN_TOKEN_TTL_HOURS=24
FRONTEND_ORIGIN=http://127.0.0.1:8000
```

The `.env` file is ignored by Git and must never be committed.

### 4. Start the application

```bash
uvicorn backend.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000` in your browser.

FastAPI serves both the frontend and API from the same origin in local development, which avoids unnecessary cross-origin configuration for the normal local workflow.

## Testing

Run the complete backend test suite with:

```bash
pytest -q
```

GitHub Actions runs the same suite automatically for pushes and pull requests targeting `master`.

## Security Notes

- Authentication secrets are supplied through environment variables.
- `.env` files, virtual environments and local SQLite databases are excluded from Git.
- Passwords are never stored in plaintext.
- Authentication tokens are signed with an HMAC secret and expire after a configurable period.
- Every transaction and budget query is scoped to the authenticated user.
- Invalid authentication returns `401` instead of exposing protected data.
- CORS is restricted to the configured frontend origin.
- API input validation rejects invalid amounts, types, dates and month values.

## Development Notes

FinPlan intentionally keeps the application lightweight. Frontend scripts are separated by responsibility: authentication UI, shared UI behavior, transaction views, CRUD behavior and settings. Backend tests are grouped by domain so regressions can be isolated without requiring a production database.

## About

FinPlan is a portfolio project focused on practical software engineering, useful financial workflows, data-driven UI and maintainable code. The project is intentionally built with a lightweight stack so the core financial logic remains easy to understand and extend.
