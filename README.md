# Bayora — Secure Adversarial AI Safety Testing Infrastructure

**Team:** Binary Titans

## About the Project

Bayora is a prototype security testing dashboard designed to identify suspicious prompts and record security review decisions. It demonstrates a basic Red Team and Blue Team workflow with an audit trail.

## Key Features

- **Red Team Testing:** Screens prompts for potential prompt injection, jailbreak, and sensitive-data exposure patterns.
- **Risk Assessment:** Assigns heuristic risk scores and highlights suspicious phrases.
- **Blue Team Review:** Allows reviewers to record security decisions and notes.
- **Audit Trail:** Records security tests and review events.
- **Hash-Chain Verification:** Checks the integrity links between stored audit events.
- **Dashboard:** Displays sessions, test results, and audit records.

## Technology Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Python, FastAPI
- **Database:** SQLite
- **API Documentation:** FastAPI / Swagger UI

## Running the Project

### 1. Start the Backend

Open a terminal:

```bash
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm run dev -- --port 5175
```

Open the frontend URL shown in the terminal, usually `http://localhost:5175/`.

### 3. API Documentation

Visit `http://127.0.0.1:8000/docs`.

## Important Limitation

Bayora currently uses rule-based heuristic screening. Its results are simulated and are not a real AI model evaluation or a guarantee that a system is secure.

## Project Status

Prototype — core testing, review recording, and audit-chain verification have been tested locally.