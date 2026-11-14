# Supabase migrations status

Two migrations: the initial books/editor schema, and `20261114000100_login_attempts.sql` (shared sign-in rate limit table plus `record_failed_login`, service-role only). Both were applied and exercised on a throwaway local Postgres 18 on 2026-11-14; neither is applied to a Supabase project yet.
