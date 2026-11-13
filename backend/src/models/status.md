# backend/src/models status

Snapshot: 2026-10-22. Update after meaningful changes; this note is not a live runtime health check.

Book schema stores title, author, category, ISBN, synopsis, abstract, cover URL, status, and timestamps. User schema has unique email and a single-editor role constraint.

Direct files: `Book.js`, `User.js`. No child folders.
