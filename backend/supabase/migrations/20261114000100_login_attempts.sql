-- Shared Chief Editor sign-in rate limit. Serverless instances do not share
-- memory, so failed attempts are counted here instead.
create table if not exists public.login_attempts (
  key_hash text primary key check (char_length(key_hash) = 64),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  reset_at timestamptz not null
);

create index if not exists login_attempts_reset_at_idx
  on public.login_attempts (reset_at);

alter table public.login_attempts enable row level security;
revoke all on table public.login_attempts from anon, authenticated;
grant all on table public.login_attempts to service_role;

-- Atomically records one failed attempt and returns the current window.
create or replace function public.record_failed_login(
  p_key_hash text,
  p_window_seconds integer
)
returns table (attempt_count integer, reset_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.login_attempts la
  where la.reset_at < now() - interval '1 day';

  return query
  insert into public.login_attempts as la (key_hash, attempt_count, reset_at)
  values (p_key_hash, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key_hash) do update
    set attempt_count = case
          when la.reset_at <= now() then 1
          else la.attempt_count + 1
        end,
        reset_at = case
          when la.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
          else la.reset_at
        end
  returning la.attempt_count, la.reset_at;
end;
$$;

revoke all on function public.record_failed_login(text, integer) from public, anon, authenticated;
grant execute on function public.record_failed_login(text, integer) to service_role;
