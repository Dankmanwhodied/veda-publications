# backend status

Snapshot: 2026-11-14. Update after meaningful changes; this note is not a live runtime health check.

Express API with public catalogue reads and Chief Editor protected CRUD/sign-in. MongoDB remains the default Compose provider. The optional Supabase/PostgreSQL adapter, initial schema, provider-neutral catalog import, and guarded Mongo-to-Supabase migration command are implemented; remote setup and live migration remain pending.

Direct files: `.dockerignore`, `Dockerfile`, `package-lock.json`, `package.json`. Subfolders: `data/`, `scripts/`, `src/`, `supabase/`.

2026-11-14: `src/server.js` exports the Express app for Vercel and only listens when run directly; it connects lazily per instance and trusts the proxy only on Vercel. Sign-in rate limiting goes through the data store (memory for MongoDB, `login_attempts` table for Supabase). Each sign-in attempt is counted atomically before the password check (fresh-agent audit fix, 14 Nov). Not yet deployed.
