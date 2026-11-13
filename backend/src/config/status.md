# backend/src/config status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

MongoDB remains the default connection via MONGODB_URI. DATABASE_PROVIDER=supabase uses the server-only Supabase client and requires its schema and credentials. Startup waits for the selected provider to pass a connection check.

Direct files: `dataStore.js`, `dataStore.test.js`, `db.js`. No child folders.
