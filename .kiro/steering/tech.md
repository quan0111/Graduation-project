# Tech Stack

## Backend (`BE/`)

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI |
| ORM / DB client | Prisma (via `prisma` Python client + `@prisma/client` Node package) |
| Database | PostgreSQL 15 |
| Auth | JWT (access token in header + refresh token in HttpOnly cookie) |
| Settings | `pydantic-settings` with `.env` file |
| File storage | Cloudinary |
| Payments | Momo, VNPay (sandbox) |
| AI / Chatbot | Ollama (local LLM, configurable model) |
| Real-time | FastAPI WebSocket (notifications) |
| Task scheduling | APScheduler |
| Server | Uvicorn |

Key Python dependencies: `fastapi`, `uvicorn[standard]`, `prisma`, `python-dotenv`, `cloudinary`, `python-multipart`, `numpy`, `joblib`, `apscheduler`, `pydantic-settings`

## Frontend — User (`user-fe/`) and Admin (`admin-FE/`)

Both frontends share the same stack:

| Layer | Technology |
|---|---|
| Language | TypeScript ~5.9 |
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| State management | Zustand v5 |
| HTTP client | Axios (with request/response interceptors for auth + token refresh) |
| UI components | Shadcn/UI (Radix UI primitives) + TailwindCSS v4 |
| Charts | Recharts |
| Forms (admin) | React Hook Form |
| Icons | Lucide React |
| Notifications | Sonner (toast) |

## Infrastructure

- **Docker Compose** orchestrates: `db` (Postgres), `backend`, `user-fe`, `admin-fe`
- **Nginx** serves built frontend assets (multi-stage Docker build: Node builder → Nginx)
- Backend runs on port `8000`, user-fe on `3000`, admin-fe on `3001`

## Common Commands

### Backend

```bash
# Install dependencies
pip install -r BE/requirements.txt

# Run dev server (from BE/ directory)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Prisma — generate client after schema changes
npx prisma generate

# Prisma — create and apply a migration
npx prisma migrate dev --name <migration_name>

# Prisma — push schema without migration (dev only)
npx prisma db push
```

### Frontend (user-fe or admin-FE)

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Docker (from repo root)

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop
docker-compose down
```

## Environment Variables

- Backend: `DATABASE_URL`, `SECRET_KEY`, `CLOUDINARY_*`, `MOMO_*`, `VNPAY_*`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
- Frontend: `VITE_API_URL` (points to backend base URL)
