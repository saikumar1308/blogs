# Blogs

A full-stack blogging platform built with React, Hono, Prisma, and Cloudflare
Workers.

## Project layout

| Folder      | What it is                                                        |
| ----------- | ----------------------------------------------------------------- |
| `frontend`  | React + Vite + TypeScript client                                  |
| `backend`   | Hono API running on Cloudflare Workers, backed by Prisma Postgres |
| `common`    | Shared Zod schemas and constants used by the API                  |

## Quick start

### 1. Shared package

```bash
cd common
npm install
npm run build
```

### 2. Backend

```bash
cd backend
copy .dev.vars.example .dev.vars   # then fill in DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate deploy          # use a direct Postgres URL
npm run dev
```

The API runs at `http://localhost:8787`. See `backend/README.md` for details.

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## What's implemented

- Public reading (feed, search, tags, pagination) without an account
- Account signup/signin with JWT expiry and automatic session expiry handling
- Authoring with create/edit/delete, ownership checks, tags, and live preview
- Consistent API error envelope: `{ "error": { "code", "message" } }`
- Dark mode, responsive layouts, accessible forms and controls, 404/error pages

## Security notes

- Rotate the Prisma Accelerate key and JWT secret that were previously committed
  to the repository.
- Secrets live in `.dev.vars` locally and `wrangler secret put` in production.
- Set `CORS_ORIGINS` in production if you want to restrict allowed origins.
