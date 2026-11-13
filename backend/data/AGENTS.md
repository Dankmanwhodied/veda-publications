# backend/data agent context

## Intent
Keep changes in `backend/data/` aligned with its responsibility: Canonical supplied JSON source for the 15 verified catalogue books; importer maps these records into MongoDB.

## Context
Read this folder’s `status.md` before editing. Follow the nearest parent `AGENTS.md`; consult `routes.md` before changing route behavior. Keep changes small, typed, accessible, and consistent with existing patterns.

## Boundaries
Do not expose secrets or copy environment values into documentation. Do not claim scaffolded features are implemented. Update local status/route notes when durable behavior changes. Keep every documentation file under 500 words.
