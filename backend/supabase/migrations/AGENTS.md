# Supabase migrations agent context

## Intent
Version PostgreSQL schema changes for the Veda backend.

## Context
Read parent `AGENTS.md`, `status.md`, and the root migration spec before adding SQL. Migrations are ordered and applied once.

## Boundaries
Preserve existing data; avoid destructive changes without an explicit migration plan. Enable RLS and keep browser roles unprivileged. Keep docs under 500 words.
