# Project Structure

## Repository Root (`d:/DATN/`)

```
DATN/
├── BE/                  # Python FastAPI backend
├── user-fe/             # React frontend for buyers
├── admin-FE/            # React frontend for admins
├── nginx/               # Nginx reverse-proxy config
├── docker-compose.yml   # Multi-service orchestration
└── .env                 # Root-level env (shared secrets)
```

---

## Backend (`BE/`)

```
BE/
├── src/
│   ├── main.py              # App factory (create_app), middleware, router mount
│   ├── api/
│   │   └── router.py        # Aggregates all module routers
│   ├── core/
│   │   ├── config.py        # Settings via pydantic-settings (@lru_cache get_settings())
│   │   ├── database.py      # Prisma client setup
│   │   ├── security.py      # JWT encode/decode, password hashing
│   │   ├── dependencies.py  # FastAPI Depends: get_current_user, require_seller, require_admin, etc.
│   │   ├── role.py          # RBAC helpers
│   │   └── lifespan.py      # Startup/shutdown events
│   ├── middleware/
│   │   ├── auth_middleware.py
│   │   └── security_middleware.py  # IP blacklist, rate limiting
│   ├── modules/             # Feature modules (one folder per domain)
│   │   └── <module>/
│   │       ├── <module>_router.py   # APIRouter with prefix and tags
│   │       ├── <module>_schema.py   # Pydantic schemas (Base / Create / Update / Out)
│   │       └── <module>_service.py  # Business logic (static/class methods, async)
│   └── utils/               # Shared utilities
├── prisma/
│   ├── schema.prisma        # Database schema (source of truth)
│   └── migrations/          # Auto-generated migration files
├── requirements.txt
└── Dockerfile
```

### Backend Conventions

- Each module follows the **router → schema → service** pattern.
- Schemas use Pydantic `BaseModel` with `Base / Create / Update / Out` variants; `Out` models set `Config.from_attributes = True`.
- Services are classes with `@staticmethod` or `async` class methods; no instance state.
- Dependency injection via `Depends(get_current_user)`, `Depends(require_seller)`, `Depends(require_admin)`.
- Soft-delete pattern: use `PATCH /{id}/delete` instead of `DELETE`.
- Settings accessed via `get_settings()` (cached singleton).

---

## Frontend — User (`user-fe/`) and Admin (`admin-FE/`)

Both apps share the same internal layout:

```
<app>/src/
├── modules/             # Feature modules (one folder per domain)
│   └── <module>/
│       ├── api/         # TanStack Query hooks (useQuery / useMutation wrappers)
│       ├── components/  # Module-specific React components
│       ├── hooks/       # Custom hooks for this module
│       ├── types/       # TypeScript interfaces / types
│       ├── utils/       # Module-specific utilities
│       └── view/        # Page-level components (routed)
├── components/
│   ├── ui/              # Shadcn/UI primitives (do not edit generated files)
│   └── layout.tsx       # Root layout (header, footer, etc.)
├── lib/
│   ├── api.ts           # Axios instance with auth interceptor + token refresh queue
│   ├── auth-storage.ts  # Token read/write helpers (localStorage)
│   ├── react-query.ts   # QueryClient config
│   └── utils.ts         # cn() and other shared helpers
├── stores/
│   └── auth.store.ts    # Zustand auth store (persisted)
├── routes/
│   └── index.tsx        # createBrowserRouter route tree
├── constant/
│   └── config.ts        # API URL constants (VITE_API_URL based)
└── main.tsx             # App entry — QueryClientProvider + RouterProvider
```

### Frontend Conventions

- API calls live in `modules/<module>/api/` as individual files, each exporting a `useXxx` hook built on `useQuery` or `useMutation`.
- `queryKey` arrays use the resource name as the first element (e.g., `["products"]`).
- Auth token is stored in `localStorage` via `auth-storage.ts`; the Axios interceptor attaches it as `Bearer <token>` and handles 401 → refresh automatically.
- Zustand store (`auth.store.ts`) holds the current user object and is persisted.
- Page components go in `view/`; reusable UI pieces go in `components/`.
- Use `cn()` from `lib/utils.ts` for conditional Tailwind class merging.
- Shadcn/UI components in `components/ui/` are generated — prefer extending over editing them directly.
- Toast notifications use `sonner`.
- Route definitions are centralized in `routes/index.tsx`.
