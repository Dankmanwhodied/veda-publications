# backend/scripts status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Catalog import and Chief Editor seed use the selected provider. `migrate:supabase` first runs as a read-only Mongo inventory; execution requires `--execute --backup-confirmed` and configured Supabase credentials. It imports by stable ID and verifies target contents.

Direct files: `importBookCatalog.js`, `migrateMongoToSupabase.js`, `seedChiefEditor.js`. No child folders.
