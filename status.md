# Repository status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Current snapshot (2026-10-22): active Next.js frontend and Express backend. MongoDB/Mongoose remains the active default. The Supabase schema, optional backend adapter, and guarded migration tooling are implemented per `SUPABASE_MIGRATION_SPEC.md`; remote setup, live migration, and cutover have not occurred. The supplied catalogue contains 15 verified titles. The working tree already contains pre-existing changes; preserve them. Do not include environment values or credentials in docs.

Direct files: `.gitignore`, `CLAUDE.md`, `README.md`, `SUPABASE_MIGRATION_SPEC.md`, `compose.yaml`, `eslint.config.mjs`, `next-env.d.ts`, `next.config.ts`, `package-lock.json`, `package.json`, `postcss.config.mjs`, `tsconfig.json`. Subfolders: `backend/`, `public/`, `src/`.
