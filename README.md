# GrowEasy AI CSV Importer

AI-powered CSV import tool that intelligently maps any CSV format to GrowEasy CRM fields.

## Features

- **Drag & Drop** CSV upload
- **Smart Preview** — see parsed rows before importing
- **AI Field Mapping** — automatically maps any CSV column names to CRM fields
- **Rule-Based Fallback** — works without any API key
- **Responsive UI** — works on desktop and mobile
- **Light Pink Theme** — modern aesthetic UI

## Tech Stack

- **Frontend:** Next.js 14 (Vercel)
- **Backend:** Node.js, Express (Render)
- **AI:** Gemini (optional, opt-in via `AI_PROVIDER=gemini`)
- **Parsing:** csv-parse

## Quick Start (Local)

### Prerequisites

- Node.js 18+

### Setup

```bash
cd backend && npm install
cd ../frontend && npm install

# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open http://localhost:3000

## Project Structure

```
├── backend/
│   └── src/
│       ├── index.js           # Express server
│       ├── routes/import.js   # API routes
│       ├── services/
│       │   ├── csvParser.js   # CSV parsing
│       │   └── aiService.js   # AI extraction + fallback mapper
│       └── utils/validation.js
├── frontend/
│   └── src/
│       ├── app/               # Next.js pages
│       ├── components/        # React components
│       └── lib/api.js         # API client
├── render.yaml
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 3001, Render: 10000) |
| `NEXT_PUBLIC_API_URL` | Yes (prod) | Backend URL (e.g. `https://api.onrender.com/api`) |
| `AI_PROVIDER` | No | Set to `gemini` to enable AI extraction |
| `GEMINI_API_KEY` | With AI | Your Gemini API key |
| `GEMINI_MODEL` | No | Gemini model (default: gemini-2.0-flash) |

## CRM Fields Extracted

created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description
