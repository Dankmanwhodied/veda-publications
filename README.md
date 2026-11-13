# Veda Publications

Veda Publications is a public book catalogue with book abstracts and direct publisher contact, plus a private Chief Editor area for catalogue maintenance. It has no online checkout, customer accounts, manuscript upload, order processing, or public registration.

## Requirements

- Node.js 22 or newer
- Docker Desktop with Docker Compose

## Configure the local environment

If `.env.local` does not exist, copy `.env.example` to the project root as `.env.local`; otherwise preserve the existing file and add or verify the documented variables. The supplied publisher contacts are `jwsasikanth@gmail.com` and WhatsApp `+91 99852 00048`.

If `backend/.env` does not exist, copy `backend/.env.example` to `backend/.env`; otherwise preserve its current database and secret settings and add or verify the documented variables. Generate a unique JWT secret with `openssl rand -hex 32`, then set the initial Chief Editor email and a unique password. The password must be at least 12 characters and no more than 72 UTF-8 bytes. Do not commit either environment file or share its secrets.

The Compose backend uses its own MongoDB service. Its container connection string is set in `compose.yaml`; the local `MONGODB_URI` setting is used by scripts run outside Docker.

MongoDB remains the active provider by default. The optional Supabase adapter, schema, and migration tooling are implemented, but no remote project has been configured or migrated. Do not change `DATABASE_PROVIDER` until the migration checklist has been completed. To begin safely, apply `backend/supabase/migrations/20261022000100_initial_schema.sql` to a non-production Supabase project, then add `SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` to `backend/.env`. Never use either secret in frontend configuration.

Before importing live records, create and verify a restorable Mongo backup. A read-only inventory is available with:

```bash
docker compose exec backend npm run migrate:supabase
```

Review the counts, duplicate ISBN groups, and catalog differences. Import is deliberately gated and repeatable by ID; run it only after backup verification and schema setup:

```bash
docker compose exec backend npm run migrate:supabase -- --execute --backup-confirmed
```

The `--backup-confirmed` flag is an operator assertion, not an automatic backup. Import does not delete Mongo data. Keep `DATABASE_PROVIDER=mongodb` until data checks and Supabase smoke tests pass. Only then switch it to `supabase` and recreate the backend. Keep the Mongo service and volume throughout the rollback window. See `SUPABASE_MIGRATION_SPEC.md` for the full acceptance and rollback criteria.

## Start the application

Start MongoDB and the backend:

```bash
docker compose up -d --build
```

Import or update the 15 verified catalogue entries currently supplied (the import is safe to rerun and updates records by ISBN):

```bash
docker compose exec backend npm run import:books
```

If you changed `backend/.env` after starting Compose, refresh the container environment:

```bash
docker compose up -d --force-recreate backend
```

Create or reset the single Chief Editor account from the credentials in `backend/.env`:

```bash
docker compose exec backend npm run seed:editor
```

Install frontend dependencies and run the site from the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend API is available locally at [http://localhost:5001](http://localhost:5001); port 5001 is used because macOS may reserve port 5000. The backend is bound to localhost by Compose. MongoDB is not published to the host.

## Catalogue and Chief Editor access

- Public catalogue: `/books`
- Chief Editor sign-in: `/admin/login`
- Catalogue management: `/admin/books`
- Public API: `GET /api/books`
- Private management API: `GET /api/books/admin`, `POST /api/books`, `PUT /api/books/:id`, and `DELETE /api/books/:id`
- Authentication: `POST /api/auth/login` and protected `GET /api/auth/me`

Only published books are returned by the public API. Drafts are visible only to the authenticated Chief Editor. The backend checks the persisted account role on every protected request; signing up and choosing a role is not supported. The seed script hashes the password and must be run intentionally to create or reset the one configured Chief Editor account.

Book catalogue records are maintained in `backend/data/books.json`; front-cover images are in `public/books/`. The importer removes obsolete ecommerce fields from existing database records while updating the catalogue. Prices and inventory are not part of the current site.

The current supplied source contains 15 verified titles. The site supports a catalogue of 25 or more, but the remaining titles and their verified book details must be provided before that target can be reached; no books or metadata have been fabricated.

## Deployment

Set `NEXT_PUBLIC_API_URL` to the public HTTPS API origin and set `CORS_ORIGINS` in the backend environment to the exact frontend origin(s), comma-separated. The frontend defaults to the provided publisher email and WhatsApp number; set `NEXT_PUBLIC_PUBLISHER_EMAIL` or `NEXT_PUBLIC_PUBLISHER_WHATSAPP` only when overriding those contacts. Configure a strong unique `JWT_SECRET` and Chief Editor credentials through the hosting platform's secret manager. Keep MongoDB private, enable TLS at the hosting edge, and do not publish the local Compose configuration as an internet-facing production deployment without a properly configured reverse proxy, backups, monitoring, and secure secret management.

The publisher biography, contact details, address, and quotation shown on the site are transcribed from the supplied owner profile. The About copy describes the existing catalogue and does not claim an unprovided organizational history or mission.
