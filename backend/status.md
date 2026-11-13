# backend status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Express API with public catalogue reads and Chief Editor protected CRUD/sign-in. MongoDB remains the default Compose provider. The optional Supabase/PostgreSQL adapter, initial schema, provider-neutral catalog import, and guarded Mongo-to-Supabase migration command are implemented; remote setup and live migration remain pending.

Direct files: `.dockerignore`, `Dockerfile`, `package-lock.json`, `package.json`. Subfolders: `data/`, `scripts/`, `src/`, `supabase/`.
