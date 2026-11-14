# Repository status

Snapshot: 2026-11-14. Update after meaningful changes; this note is not a live runtime health check.

Update (2026-11-14): `GO_LIVE_SPEC.md` approved (personal accounts, vercel.app URL, books.json is the full catalogue). Code is ready: shared Supabase sign-in rate limit and a Vercel-ready Express export. Supabase and Vercel projects are not yet created; nothing is deployed.

Previous snapshot (2026-10-22): active Next.js frontend and Express backend. MongoDB/Mongoose remains the active default. The Supabase schema, optional backend adapter, and guarded migration tooling are implemented per `SUPABASE_MIGRATION_SPEC.md`; remote setup, live migration, and cutover have not occurred. The supplied catalogue contains 15 verified titles. The working tree already contains pre-existing changes; preserve them. Do not include environment values or credentials in docs.

Direct files: `.gitignore`, `CLAUDE.md`, `README.md`, `SUPABASE_MIGRATION_SPEC.md`, `compose.yaml`, `eslint.config.mjs`, `next-env.d.ts`, `next.config.ts`, `package-lock.json`, `package.json`, `postcss.config.mjs`, `tsconfig.json`. Subfolders: `backend/`, `public/`, `src/`.
