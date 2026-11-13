# Repository routes

## Frontend
- / — homepage, catalogue categories, About, submission guidance, and contact.
- /books — searchable/filterable published catalogue with abstract dialogs.
- /books/[id] — legacy segment redirects to /books.
- /admin/login — Chief Editor sign-in.
- /admin/books — Chief Editor catalogue management.
- /login — redirects to /admin/login.
- /cart and /checkout — redirect to /books; no order flow is implemented.

## Backend API (port 5000 in container; host port 5001 in local Compose)
- GET / — API health response.
- GET /api/books — published books.
- GET /api/books/admin — all books; Chief Editor JWT required.
- POST /api/books, PUT /api/books/:id, DELETE /api/books/:id — protected catalogue management.
- POST /api/auth/login — Chief Editor sign-in.
- GET /api/auth/me — protected Chief Editor identity.
