# backend/src/controllers status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Book handlers support published listing, admin listing, create/update/delete, input validation, and explicit API errors through the selected MongoDB or Supabase data store. Auth validates and rate-limits editor sign-in.

Direct files: `authController.js`, `bookController.js`. No child folders.
