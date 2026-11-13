# Supabase agent context

## Intent
Keep Supabase schema and migration assets aligned with the backend PostgreSQL transition.

## Context
Read this folder's `status.md` and `routes.md` before editing. SQL is applied with the Supabase migration workflow; never store credentials here.

## Boundaries
MongoDB remains the default provider until a verified cutover. Enable RLS and restrict table access to the backend role. Keep all documentation under 500 words.
