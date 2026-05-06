# 7. Complete Project Setup Guide

This guide is written for a developer who has just found the project on GitHub and has not worked on it before. Follow the steps in order.

## 7.1 What You Are Setting Up

The project has three main parts:

- **Frontend:** Next.js app in `frontend/`
- **Database:** PostgreSQL, managed locally through Docker Compose
- **AI backend:** FastAPI app at the repository root, used for resume scoring and mock interviews

Default local URLs:

- Frontend: `http://localhost:3000`
- FastAPI backend: `http://localhost:8000`
- Backend health check: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`

## 7.2 Prerequisites

Install these before starting:

- **Git**
- **Docker Desktop** or Docker Engine with Docker Compose
- **Node.js 20 or newer**
- **npm**
- **Python 3.13 or newer**
- **uv** for Python dependency management
- Optional: **Ollama**, if you want to run the AI backend locally without Modal
- Optional: **Modal CLI account**, if you want to deploy the GPU AI endpoint

Check your versions:

```bash
git --version
docker --version
docker compose version
node --version
npm --version
python --version
uv --version
```

If `uv` is missing, install it from the official uv documentation, then restart your terminal.

## 7.3 Clone the Repository

Choose a folder where you keep projects, then run:

```bash
git clone <repository-url>
cd smart-job-portal
```

Replace `<repository-url>` with the GitHub clone URL.

## 7.4 Understand the Folder Structure

Important files and folders:

```text
smart-job-portal/
|-- app/                    # FastAPI backend package
|-- docs/                   # Project documentation
|-- frontend/               # Next.js frontend
|-- modal/                  # Modal GPU deployment files
|-- main.py                 # FastAPI entrypoint
|-- pyproject.toml          # Python dependencies
|-- uv.lock                 # Locked Python dependency versions
|-- docker-compose.yml      # Local PostgreSQL database
|-- .env.example            # Backend environment example
`-- frontend/.env.example   # Frontend environment example
```

## 7.5 Start PostgreSQL

From the repository root, start the database:

```bash
docker compose up -d
```

Confirm the container is running:

```bash
docker compose ps
```

The local database values from `docker-compose.yml` are:

```text
Host: localhost
Port: 5432
Database: smart_job_portal
Username: postgres
Password: password123
```

The matching Prisma connection string is:

```text
postgresql://postgres:password123@localhost:5432/smart_job_portal?schema=public
```

## 7.6 Configure Backend Environment Variables

From the repository root, copy the backend environment example:

```bash
cp .env.example .env
```

Open `.env`.

For the easiest local setup without Modal, use Ollama mode:

```env
MODAL_ENDPOINT_URL=
USE_MODAL=false
```

For Modal GPU mode, leave `USE_MODAL=true` and fill `MODAL_ENDPOINT_URL` after deploying the Modal endpoint. Modal setup is covered later in this guide.

Do not commit `.env`. It is intentionally gitignored.

## 7.7 Install Backend Dependencies

From the repository root, install Python dependencies:

```bash
uv sync
```

This creates or updates the local Python virtual environment using `pyproject.toml` and `uv.lock`.

## 7.8 Choose the AI Runtime

The backend can analyze resumes in two ways.

### Option A: Local Ollama

Use this for local development when you do not want to deploy Modal.

Install Ollama, start it, then pull the model used by the backend:

```bash
ollama pull batiai/gemma4-e2b:q4
```

Make sure `.env` contains:

```env
USE_MODAL=false
MODAL_ENDPOINT_URL=
```

The backend will call Ollama when resume scoring or interview AI logic is used.

### Option B: Modal GPU Endpoint

Use this when you want the hosted GPU-backed vLLM endpoint.

Install backend dependencies first with `uv sync`, then authenticate and deploy:

```bash
uv run modal token new
uv run bash modal/setup.sh
```

The script will:

- Authenticate with Modal
- Ask for a Hugging Face token if `HF_TOKEN` is not already set
- Create the Modal secret
- Deploy `modal/resume_analyzer.py`

After deployment, copy the Modal URL printed by Modal. It should end with `.modal.run`.

Update the root `.env`:

```env
MODAL_ENDPOINT_URL=https://your-modal-endpoint.modal.run
USE_MODAL=true
```

Restart the FastAPI server after changing `.env`.

## 7.9 Start the Backend

From the repository root:

```bash
uv run python main.py
```

The backend should start on:

```text
http://localhost:8000
```

In another terminal, test it:

```bash
curl http://localhost:8000/health
```

Expected response shape:

```json
{
  "status": "ok",
  "backend": "ollama-local",
  "modal_configured": false
}
```

If you configured Modal, `backend` should show `modal-gpu`.

## 7.10 Configure Frontend Environment Variables

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Copy the frontend environment example:

```bash
cp .env.example .env
```

Open `frontend/.env` and set:

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/smart_job_portal?schema=public"
NEXTAUTH_SECRET="replace-this-with-a-real-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:8000"
API_URL="http://localhost:8000/api/v1"
```

Generate a stronger `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Replace `replace-this-with-a-real-secret` with the generated value.

The example file also contains admin seed variables, but this project currently does not include a seed script. Create users through the signup flow after the app is running.

Do not commit `frontend/.env`.

## 7.11 Install Frontend Dependencies

From `frontend/`:

```bash
npm install
```

This installs the dependencies from `package-lock.json`.

## 7.12 Set Up the Database Schema

From the repository root, make sure PostgreSQL is still running:

```bash
docker compose ps
```

If you are inside `frontend/`, use:

```bash
cd ..
docker compose ps
cd frontend
```

Apply the Prisma migrations from `frontend/`:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Optional: inspect the database in Prisma Studio:

```bash
npx prisma studio
```

Prisma Studio usually opens at:

```text
http://localhost:5555
```

## 7.13 Start the Frontend

From `frontend/`:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

At this point, keep these terminals running:

- Terminal 1: `docker compose up -d` database container
- Terminal 2: `uv run python main.py` backend
- Terminal 3: `npm run dev` frontend

## 7.14 First-Time App Flow

After the frontend opens:

1. Go to `http://localhost:3000/signup`.
2. Create a job seeker account.
3. Create an employer account if you want to test employer pages.
4. Sign in at `http://localhost:3000/login`.
5. For seeker testing, fill the profile and upload a text-readable PDF resume.
6. For employer testing, create a job posting from the employer dashboard.
7. Apply to a job as a seeker to test application flow and AI scoring.
8. Use the seeker interview page to test the WebSocket-based mock interview.

The AI features require either:

- Ollama running locally with `batiai/gemma4-e2b:q4` pulled, or
- A configured Modal endpoint in the root `.env`

## 7.15 Useful Development Commands

Run backend:

```bash
uv run python main.py
```

Run frontend:

```bash
cd frontend
npm run dev
```

Run frontend lint:

```bash
cd frontend
npm run lint
```

Build frontend:

```bash
cd frontend
npm run build
```

Apply database migrations:

```bash
cd frontend
npx prisma migrate dev
```

Regenerate Prisma client:

```bash
cd frontend
npx prisma generate
```

Open Prisma Studio:

```bash
cd frontend
npx prisma studio
```

Stop the database from the repository root:

```bash
docker compose down
```

Stop the database and delete local database data from the repository root:

```bash
docker compose down -v
```

Only use `docker compose down -v` when you are okay with deleting all local PostgreSQL data for this project.

## 7.16 API Smoke Tests

Backend health:

```bash
curl http://localhost:8000/health
```

Resume scoring with profile text:

```bash
curl -X POST http://localhost:8000/api/v1/score-profile \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Software engineer with Python, React, PostgreSQL, and FastAPI experience.",
    "job_description": "We need a full stack developer with Python, React, and PostgreSQL experience."
  }'
```

PDF resume parsing requires a real text-readable PDF:

```bash
curl -X POST http://localhost:8000/api/v1/parse-resume \
  -F "job_description=Python developer with FastAPI experience" \
  -F "resume_file=@/path/to/resume.pdf"
```

## 7.17 Troubleshooting

### Port 5432 is already in use

Another PostgreSQL instance is running. Either stop the other database or edit `docker-compose.yml` to map a different local port, then update `DATABASE_URL` in `frontend/.env`.

### Prisma cannot connect to the database

Check:

- Docker container is running with `docker compose ps`
- `DATABASE_URL` uses `postgres`, `password123`, `localhost`, port `5432`, and database `smart_job_portal`
- You ran Prisma commands from the `frontend/` folder

### Frontend cannot call the backend

Check:

- Backend is running on `http://localhost:8000`
- `frontend/.env` contains `NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"`
- Restart `npm run dev` after changing `frontend/.env`

### Mock interview cannot connect

Check:

- Backend is running
- `frontend/.env` contains `NEXT_PUBLIC_WS_URL="ws://localhost:8000"`
- Restart the frontend after changing environment variables

### AI scoring fails with Ollama

Check:

- Ollama is installed and running
- The model exists locally:

```bash
ollama list
```

- Pull the required model if missing:

```bash
ollama pull batiai/gemma4-e2b:q4
```

- Root `.env` contains `USE_MODAL=false`

### AI scoring fails with Modal

Check:

- Root `.env` contains a valid `MODAL_ENDPOINT_URL`
- `USE_MODAL=true`
- The Modal app is deployed
- You restarted the backend after editing `.env`
- The Modal endpoint may take a few minutes to wake up on first request

### Environment variable changes do not apply

Restart the process that uses the changed file:

- Root `.env`: restart FastAPI
- `frontend/.env`: restart Next.js

## 7.18 Clean Restart From Scratch

Use this when you want to reset your local setup completely.

From the repository root:

```bash
docker compose down -v
docker compose up -d
```

Then from `frontend/`:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Then from the repository root in another terminal:

```bash
uv run python main.py
```

## 7.19 Final Checklist

Before developing, confirm all of these are true:

- PostgreSQL container is running
- Root `.env` exists
- `frontend/.env` exists
- Backend dependencies are installed with `uv sync`
- Frontend dependencies are installed with `npm install`
- Prisma migrations have been applied
- Prisma client has been generated
- Backend health check returns `status: ok`
- Frontend loads at `http://localhost:3000`
- AI runtime is configured through either Ollama or Modal
