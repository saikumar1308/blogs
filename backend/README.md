# Backend (Cloudflare Workers + Hono + Prisma)

## Local development

This backend imports the local shared package at `../common`. Install/build it
once (and again after changing `common/src`):

```bash
cd ../common
npm install
npm run build
```

Then, in this directory:

1. Copy `.dev.vars.example` to `.dev.vars` and fill in `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:

```bash
npm install
```

3. Apply database migrations (use a direct Postgres connection string, not the
   Prisma Accelerate URL):

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

4. Start the worker:

```bash
npm run dev
```

The API is available at `http://localhost:8787`. Health check: `GET /health`.

## Production

Secrets must be stored in Cloudflare, not in `wrangler.toml`:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
npm run deploy
```

Set `CORS_ORIGINS` to your frontend origin(s) if you want to restrict CORS:

```bash
npx wrangler secret put CORS_ORIGINS
# e.g. https://blogs.example.com,http://localhost:5173
```

## API conventions

- Success responses return their resource directly, e.g. `{ "blog": { ... } }`.
- Errors always use the same envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the form and try again",
    "details": {}
  }
}
```

- Status codes: `400` validation, `401` invalid/missing session, `403` forbidden,
  `404` missing resource, `409` conflict, `500` unexpected server error.
