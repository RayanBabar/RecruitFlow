# Smart Job Portal

Smart Job Portal is a recruitment platform for job seekers, employers, and administrators. It combines a Next.js web application, PostgreSQL database, and FastAPI AI backend for resume parsing, job-match scoring, and mock interview sessions.

## Features

- Job seeker signup, login, profile management, resume upload, job browsing, applications, and application tracking.
- Employer dashboard for posting jobs, reviewing applicants, managing candidates, pipeline actions, analytics, and employer profile verification.
- Admin area for employer oversight and verification decisions.
- AI resume parsing and match scoring against job descriptions.
- WebSocket-based mock interview flow powered by the AI backend.
- PostgreSQL data layer managed with Prisma migrations.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, NextAuth, Prisma
- **Backend:** FastAPI, Pydantic, LangChain, LangGraph, pdfplumber
- **Database:** PostgreSQL 15 through Docker Compose
- **AI runtime:** Local Ollama or Modal GPU endpoint
- **Package managers:** npm for frontend, uv for Python backend

## Project Structure

```text
smart-job-portal/
|-- app/                    # FastAPI backend package
|-- docs/                   # Project documentation
|-- frontend/               # Next.js app and Prisma schema
|-- modal/                  # Modal deployment files
|-- main.py                 # FastAPI entrypoint
|-- pyproject.toml          # Python dependencies
|-- docker-compose.yml      # Local PostgreSQL service
|-- .env.example            # Backend environment example
`-- README.md
```

## Prerequisites

- Git
- Docker and Docker Compose
- Node.js 20 or newer
- npm
- Python 3.13 or newer
- uv
- Optional: Ollama for local AI inference
- Optional: Modal CLI account for hosted GPU inference

## Quick Start

Clone the repository and enter the project:

```bash
git clone <repository-url>
cd smart-job-portal
```

Start PostgreSQL:

```bash
docker compose up -d
```

Configure the backend:

```bash
cp .env.example .env
uv sync
```

For local AI development without Modal, set these values in `.env`:

```env
MODAL_ENDPOINT_URL=
USE_MODAL=false
```

If you use Ollama locally, install Ollama and pull the model:

```bash
ollama pull batiai/gemma4-e2b:q4
```

Start the FastAPI backend:

```bash
uv run python main.py
```

The backend runs at `http://localhost:8000`.

Configure and install the frontend:

```bash
cd frontend
cp .env.example .env
npm install
```

Set `frontend/.env` for the local Docker database:

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/smart_job_portal?schema=public"
NEXTAUTH_SECRET="replace-with-a-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:8000"
API_URL="http://localhost:8000/api/v1"
```

Generate a NextAuth secret with:

```bash
openssl rand -base64 32
```

Apply database migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Local URLs

- Frontend: `http://localhost:3000`
- FastAPI backend: `http://localhost:8000`
- Backend health check: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Prisma Studio: `http://localhost:5555`

## Useful Commands

Run the backend:

```bash
uv run python main.py
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

Build the frontend:

```bash
cd frontend
npm run build
```

Open Prisma Studio:

```bash
cd frontend
npx prisma studio
```

Stop the database:

```bash
docker compose down
```

Reset the local database data:

```bash
docker compose down -v
docker compose up -d
cd frontend
npx prisma migrate dev
npx prisma generate
```

## API Smoke Tests

Check backend health:

```bash
curl http://localhost:8000/health
```

Score profile text against a job description:

```bash
curl -X POST http://localhost:8000/api/v1/score-profile \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Software engineer with Python, React, PostgreSQL, and FastAPI experience.",
    "job_description": "We need a full stack developer with Python, React, and PostgreSQL experience."
  }'
```

Parse and score a PDF resume:

```bash
curl -X POST http://localhost:8000/api/v1/parse-resume \
  -F "job_description=Python developer with FastAPI experience" \
  -F "resume_file=@/path/to/resume.pdf"
```

## AI Backend Options

The backend chooses the AI runtime from the root `.env` file.

- `USE_MODAL=false`: use local Ollama.
- `USE_MODAL=true` with `MODAL_ENDPOINT_URL`: use the deployed Modal GPU endpoint.

To deploy the Modal endpoint:

```bash
uv run modal token new
uv run bash modal/setup.sh
```

Copy the deployed Modal URL into `.env` as `MODAL_ENDPOINT_URL`, then restart the backend.

## Documentation

More detailed project docs are in `docs/`:

- [Project overview](docs/01_project_overview.md)
- [Architecture design](docs/02_architecture_design.md)
- [Database schema](docs/03_database_schema.md)
- [API contracts](docs/04_api_contracts.md)
- [Development roadmap](docs/05_development_roadmap.md)
- [Design notes](docs/06_design.md)
- [Complete setup guide](docs/07_setup_guide.md)
