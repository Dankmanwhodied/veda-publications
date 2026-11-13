# MongoDB to Supabase Migration Spec

**Status:** In progress. Schema, provider adapter, and import tooling are implemented; remote setup/data migration are pending.  
**Scope:** Replace MongoDB/Mongoose with Supabase PostgreSQL. Keep Express, frontend/API contracts, bcrypt, and Chief Editor JWT authentication.

## Goals and constraints

- Preserve published-only public reads and Chief Editor draft visibility/CRUD. Keep API paths and response shapes; map PostgreSQL `id` to API `_id`.
- Keep Supabase secret/service-role credentials backend-only, never in `NEXT_PUBLIC_*`. Do not adopt Supabase Auth, Storage, or browser database access.
- Retain MongoDB and backups through the rollback window.

## Target data model

- `books`: text primary key preserving Mongo `_id`; existing book fields and timestamps. Enforce current required fields, limits, status values, plus status/title and ISBN indexes.
- `editor_accounts`: preserve account ID, normalized unique email, name, bcrypt hash, role, and timestamps; enforce one `chief_editor` with a partial unique index.
- Keep local covers in `public/books/`. Enable RLS and grant no browser-role access. Backend queries explicitly filter public reads and protects admin actions with JWT/role checks.

## Work plan

1. **Inventory:** confirm live book/editor counts; create a restorable Mongo backup. Compare live records with `backend/data/books.json`, flag duplicate/missing ISBNs and edits. Live data is authoritative; JSON is reference, not an overwrite source.
2. **Schema:** versioned SQL migration and constraints are present. Apply/verify RLS and grants in a non-production project before import.
3. **Adapter:** server-only Supabase provider is available via `DATABASE_PROVIDER=supabase`; Mongo remains the default. API validation, serialization, timestamps, errors, and access checks remain in place.
4. **Import:** gated migration command imports live records by stable ID and verifies IDs, values, and counts. Run only after backup and Supabase setup; never log password hashes.
5. **Cutover/rollback:** pause Mongo writes; import and verify data; smoke-test every API route and editor login/CRUD. Switch backend config and monitor. If checks fail, pause writes and restore the prior backend before reopening edits. Retain Mongo through the rollback window.

## Acceptance criteria

- Public API returns only published books; admin API returns drafts and published records.
- Existing frontend works without API contract changes; editor login and role checks remain effective.
- Create/update (including status preservation), delete, sorting, and validation match current behavior.
- Imported IDs/counts match the frozen Mongo snapshot; all row failures are resolved.
- Browser roles cannot access tables; secret keys are absent from frontend bundles.
- Backup restore and rollback are tested before production cutover.

## Open checks

Pending: Supabase project/region, secure credentials, verified backup, non-production schema/RLS checks, and live Mongo inventory. Do not switch providers or retire Mongo until acceptance criteria pass. Supabase Auth is out of scope.
