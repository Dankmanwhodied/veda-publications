# Go-live spec: Supabase + Vercel

**Status:** Approved 14 Nov 2026: personal accounts, `vercel.app` first, `books.json` is the full catalogue (step 4 uses `import:books`); admin add/remove stays.
**Builds on:** `SUPABASE_MIGRATION_SPEC.md` (data model, RLS, acceptance criteria stay as written).

## Outcome

The catalogue and Chief Editor admin run live on Vercel, backed by Supabase. The Chief Editor signs in at `/admin/login` with owner-set credentials. MongoDB leaves production.

## Stack

| Part | Host | Notes |
|---|---|---|
| Next.js site | Vercel project 1 (repo root) | `NEXT_PUBLIC_API_URL` points at project 2 |
| Express API | Vercel project 2 (root dir `backend`) | Runs as one Vercel function; keeps the same routes |
| Database | Supabase, Mumbai (`ap-south-1`) | Free tier; backend-only secret key |

## Work

1. **Supabase project.** Create the project, apply both migrations in `backend/supabase/migrations/` in order, and check that browser roles can't read either table.
2. **Login rate limit table.** The current limiter lives in server memory, and memory resets on each Vercel instance. Add a `login_attempts` table (IP hash, count, reset time) and use it when `DATABASE_PROVIDER=supabase`. Login behaviour stays the same: 8 attempts per 15 minutes.
3. **Express on Vercel.** Export the app from `server.js`, calling `listen` only locally; connect once per cold start; set `trust proxy` so the limiter sees real IPs. Docker Compose still works locally.
4. **Data.** Local MongoDB is the only Mongo copy, and Docker isn't running. If it holds edits, back it up and run `migrate:supabase --execute --backup-confirmed`. If not, run `import:books` against Supabase from `backend/data/books.json` (15 titles). Check the counts and the IDs either way.
5. **Admin login.** The owner types `CHIEF_EDITOR_EMAIL`, `CHIEF_EDITOR_PASSWORD` (12–72 characters) and `CHIEF_EDITOR_NAME` straight into the backend environment. Claude never sees them. Run `seed:editor` once against Supabase, then remove the password variable from Vercel. The bcrypt hash in the database is enough.
6. **Vercel env.** Backend: `DATABASE_PROVIDER=supabase`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET` (32+ bytes), `CORS_ORIGINS` (exact site URL). Frontend: `NEXT_PUBLIC_API_URL`. Secrets go only into the Vercel dashboard; Claude never asks for values.
7. **Verify on a preview deploy.** Only published books are public; login works and a wrong password fails; create, edit and delete work; bad tokens are rejected; no Supabase key is in the browser bundle.
8. **Promote to production.** Retire MongoDB from the production config, but keep the code path and backup for 30 days as the rollback route.

## Not in scope

Supabase Auth or Storage, orders and checkout, a second admin, email password reset (re-run the seed script instead), and custom domain DNS unless a domain is named.

## Owner decisions needed

1. Which accounts own it: your personal GitHub, Vercel and Supabase, or the Vandorio ones? Veda is personal side work, so the default is personal (`personal` remote).
2. A custom domain now, or the `*.vercel.app` URL first?
3. Does the local MongoDB hold edits made through the admin, or is `books.json` the full catalogue?

## Gates

Creating the Supabase and Vercel projects, pushing, and the production deploy each get a go-ahead when reached. Code changes and the preview deploy proceed under this approval.
