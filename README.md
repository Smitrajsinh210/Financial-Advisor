# AI Financial Advisor

AI Financial Advisor is a full-stack personal finance platform with a modern fintech UI, secure authentication, transaction tracking, budgeting, savings goals, AI-powered recommendations, reports, admin analytics, multilingual preferences, currency support, and deployment-ready structure.

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Framer Motion
- Backend: Node.js, Express, SQLite, JWT, bcrypt
- AI: OpenAI integration with a safe rule-based fallback
- Reporting: PDF export, CSV export, email summary hooks

## Features

- Landing page with hero, features, testimonials, pricing, and contact footer
- Login, register, and forgot-password flows
- Dashboard with KPI cards and charts
- Expense tracker with recurring flag support
- Budget planner
- Savings goals manager
- AI chat advisor with browser voice input
- Reports page with PDF, CSV, and email summary actions
- Profile settings with English, Hindi, Gujarati and INR/USD support
- Admin panel with platform metrics and user moderation
- Dark and light mode

## Folder Structure

```text
client/
  src/
    components/
    context/
    data/
    hooks/
    pages/
    utils/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
```

## Environment Variables

Copy the root env file:

```bash
cp .env.example .env
```

Copy the client env file:

```bash
cp client/.env.example client/.env
```

Then set:

- `SQLITE_PATH` if you want a custom database file location
- `JWT_SECRET`
- `OPENAI_API_KEY` if you want live AI responses
- SMTP settings if you want email summaries and password reset email delivery

## Local Development

Install dependencies:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Run both apps:

```bash
npm run dev
```

Frontend:

- [http://localhost:5173](http://localhost:5173)

Backend:

- [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Backend API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### User

- `GET /api/users/me`
- `PUT /api/users/me`

### Transactions

- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Budgets

- `GET /api/budgets`
- `POST /api/budgets`
- `DELETE /api/budgets/:id`

### Goals

- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

### Reports

- `GET /api/reports/dashboard`
- `GET /api/reports/export/pdf`
- `GET /api/reports/export/csv`
- `POST /api/reports/email-summary`

### AI

- `GET /api/ai/history`
- `POST /api/ai/advisor`

### Admin

- `GET /api/admin/overview`
- `DELETE /api/admin/users/:id`

## Suggested First Admin User

After registering normally, open the SQLite database file and set the `role` column in the `users` table to `admin` for the account you want to use for the admin panel.

## Deployment

Deployment instructions are in [DEPLOYMENT.md](/D:/AI%20Financial%20Advisor/DEPLOYMENT.md).

## Notes

- If `OPENAI_API_KEY` is missing, the AI advisor still works with built-in rule-based financial insights.
- The app now uses a local SQLite database file by default, so MongoDB/Atlas is no longer required for local development.
- The forgot-password endpoint prepares a reset token and returns a reset URL for local development. Email delivery requires SMTP configuration.
- Browser voice input depends on Web Speech API support in the user’s browser.
