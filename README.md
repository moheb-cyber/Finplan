# FinPlan

A personal finance decision and planning platform focused on turning everyday financial data into clear, practical insights.

## Status

🚧 In active development.

## Features

- Track income and expenses
- Organize financial transactions by category
- Filter and search transaction history
- Create, update and delete monthly budgets
- View dashboard income, expenses, balance and budget usage
- Review spending by category
- Switch between English and Persian UI
- Switch between USD and IRR display
- Navigate between months

## Tech Stack

- HTML / CSS / JavaScript
- Python
- FastAPI
- SQLAlchemy
- SQLite

## Project Structure

```text
Finplan/
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── transactions-view.js
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
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the API

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Start the frontend

Serve the `frontend` directory with a local static server on port `5500`, then open the frontend in your browser.

The frontend currently expects the API at `http://127.0.0.1:8000`.

## About

FinPlan is a portfolio project focused on practical software engineering, useful financial workflows, data-driven UI and maintainable code. The project is intentionally built with a lightweight stack so the core financial logic remains easy to understand and extend.
