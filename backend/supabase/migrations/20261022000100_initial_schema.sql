create table if not exists public.books (
  id text primary key default (gen_random_uuid()::text),
  title varchar(200) not null check (char_length(trim(title)) between 1 and 200),
  author varchar(200) not null default '',
  category varchar(100) not null default '',
  isbn varchar(32) not null default '',
  synopsis varchar(500) not null default '',
  abstract varchar(12000) not null default '',
  cover_image_url varchar(1000) not null default '',
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_published_title_idx
  on public.books (title)
  where status = 'published';

create index if not exists books_status_updated_at_idx
  on public.books (status, updated_at desc);

create index if not exists books_isbn_idx
  on public.books (isbn)
  where isbn <> '';

create table if not exists public.editor_accounts (
  id text primary key default (gen_random_uuid()::text),
  name varchar(200) not null,
  email varchar(254) not null unique
    check (email = lower(trim(email))),
  password_hash text not null,
  role text not null default 'chief_editor'
    check (role = 'chief_editor'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_chief_editor
  on public.editor_accounts (role)
  where role = 'chief_editor';

alter table public.books enable row level security;
alter table public.editor_accounts enable row level security;

revoke all on table public.books from anon, authenticated;
revoke all on table public.editor_accounts from anon, authenticated;
grant all on table public.books to service_role;
grant all on table public.editor_accounts to service_role;
