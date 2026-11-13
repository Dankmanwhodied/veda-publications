# backend/src/middleware status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Bearer token verification reloads the persisted user from the selected provider and enforces the chief_editor role. Keep checks on all protected routes; database failures return server errors, not invalid-session responses.

Direct files: `authMiddleware.js`. No child folders.
