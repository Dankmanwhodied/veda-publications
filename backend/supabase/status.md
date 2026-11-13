# Supabase status

Snapshot: 2026-10-22. The initial schema is implemented alongside MongoDB; no remote project is configured or migrated.

The books/editor SQL schema is present in `migrations/`. Apply and validate it in a non-production project before selecting the Supabase provider. Do not mark cutover complete until data validation and rollback checks pass.

Direct files: none. Subfolders: `migrations/`.
