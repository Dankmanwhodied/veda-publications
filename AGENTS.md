<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ICM: interpretable context methodology

- **Intent:** This file gives repository-wide agent boundaries. Follow the closest nested `AGENTS.md` for folder-specific context.
- **Context:** Read the local `status.md` before editing and keep it current when durable implementation status changes.
- **Map:** Read the nearest `routes.md` before changing a user-facing page or API endpoint.
- Keep each documentation file below 500 words. Never copy secrets into documentation. Generated and dependency folders are excluded.
- Go-live to Vercel + Supabase is approved and in progress per `GO_LIVE_SPEC.md`. MongoDB stays the local Compose default until cutover; check `status.md` for what is actually live.
