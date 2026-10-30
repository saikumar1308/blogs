# Blogs — Frontend

React + TypeScript + Vite client for the Blogs platform.

## Local development

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app expects the API at `http://localhost:8787` by default. Override it with
`VITE_BACKEND_URL` in `.env`.

## Scripts

```bash
npm run dev      # start Vite
npm run build    # type-check and build for production
npm run lint     # ESLint
npm run preview  # preview the production build
```

## Notes

- Reading is public. Signing in is only required to write, edit, or delete posts.
- API errors use the shape `{ error: { code, message, details? } }`.
- Session expiry is handled globally by the axios client in `src/lib/api.ts`.
