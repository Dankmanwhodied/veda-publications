# Veda Publications

A public book catalogue with abstracts and direct publisher contact, plus a private Chief Editor area for adding, editing and removing books. There is no checkout, customer accounts or public sign-up.

- Website: Next.js (repo root). API: Express (`backend/`). Database: Supabase Postgres in production; MongoDB via Docker for local development.
- Routes: `/books` (catalogue), `/admin/login` (sign-in), `/admin/books` (management). See `routes.md`.

## Go live: Supabase + Vercel

Full plan and checks: `GO_LIVE_SPEC.md`. Never commit secrets; this repo is public.

1. **Supabase.** Create a project (Mumbai region). In the SQL editor, run both files in `backend/supabase/migrations/` in filename order. The API will not start without the second (`login_attempts`).
2. **Load data and the admin account.** In `backend/.env` set `DATABASE_PROVIDER=supabase`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (server-only secret key) and the `CHIEF_EDITOR_*` values, then:

   ```bash
   cd backend && npm install && npm run import:books && npm run seed:editor
   ```

   `import:books` loads the 15 titles from `backend/data/books.json` and is safe to rerun.
3. **Vercel API project.** Import this repo with **Root Directory `backend`**. Environment variables: `DATABASE_PROVIDER=supabase`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET` (`openssl rand -hex 32`), `CORS_ORIGINS` (exact website URL, e.g. `https://veda-publications.vercel.app`; comma-separate several).
4. **Vercel website project.** Import the repo again with the root directory left as is. Set `NEXT_PUBLIC_API_URL` to the API project's URL.
5. **Redeploy the API** after the website URL is known so `CORS_ORIGINS` is right, then check: only published books show publicly, admin sign-in works, a wrong password fails, and add/edit/delete work.

Supabase keys belong only in the API project, never in a `NEXT_PUBLIC_*` variable.

## Change the admin login ID or password

There is one Chief Editor account. Put the new `CHIEF_EDITOR_EMAIL`, `CHIEF_EDITOR_PASSWORD` (12–72 characters) and optional `CHIEF_EDITOR_NAME` in `backend/.env` alongside the Supabase settings from step 2, then run `cd backend && npm run seed:editor`. It replaces the existing account's details; the old login stops working immediately. Delete the password from `.env` afterwards.

Existing sign-ins last up to 8 hours. To sign everyone out at once, change `JWT_SECRET` in the API project and redeploy.

## Books

Add, edit, publish or remove books at `/admin/books`. Covers can be an HTTPS image URL or a file in `public/books/` (a new file there needs a commit and redeploy). Sign-in is limited to 8 attempts per 15 minutes per IP.

## Local development

Needs Node.js 22+ and Docker Desktop. Copy `.env.example` to `.env.local` and `backend/.env.example` to `backend/.env` (keep existing files), set `JWT_SECRET` and the Chief Editor values, then:

```bash
docker compose up -d --build
docker compose exec backend npm run import:books
docker compose exec backend npm run seed:editor
npm install && npm run dev
```

Site: http://localhost:3000. API: http://localhost:5001. Tests: `cd backend && npm test`.
