# FinPlan

A personal finance decision and planning platform focused on turning everyday financial data into clear, practical insights.

## Version 1

FinPlan v1 provides authenticated personal finance tracking with real backend persistence, transaction and budget CRUD, dashboard summaries, analytics, settings, bilingual UI, and currency display preferences.

## Features

- Secure account registration and sign-in
- Token-based authentication with configurable secret and expiration
- Password hashing with salted PBKDF2-HMAC-SHA256
- Track income and expenses
- Create, update and delete transactions
- Filter transaction history by type, category and date range
- Create, update and delete monthly budgets
- Prevent duplicate budgets for the same category and month
- View dashboard income, expenses, balance and budget usage
- Review spending by category and transaction summaries
- Switch between English and Persian UI
- Switch between USD and IRR display
- Navigate between months
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
│   ├── script.js
│   ├── transactions-view.js
│   └── settings-v1.js
├── data/
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Run Locally

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\\.venv\\Scripts\\Activate.ps1
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and replace `FINPLAN_AUTH_SECRET` with a long random secret.

The `.env` file is ignored by Git and must never be committed.

### 4. Start the application

```bash
uvicorn backend.main:app --reload --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

The FastAPI application serves the frontend and API from the same origin in local development.

## Testing

Run the complete backend test suite with:

```bash
pytest -q
```

CI runs the same test suite automatically on pushes and pull requests targeting `master`.

## Security Notes

- Authentication secrets are supplied through environment variables.
- Local `.env` files and SQLite databases are excluded from Git.
- Passwords are never stored in plaintext.
- Authentication tokens are signed and expire after a configurable period.
- API queries are scoped to the authenticated user's records.
- CORS is restricted to the configured frontend origin.

## About

FinPlan is a portfolio project focused on practical software engineering, useful financial workflows, data-driven UI and maintainable code. The project is intentionally built with a lightweight stack so the core financial logic remains easy to understand and extend.
