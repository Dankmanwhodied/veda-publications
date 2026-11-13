const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createDataStore,
  fromDatabaseBook,
  fromDatabaseEditor,
  toDatabaseEditor,
  toDatabaseBook,
} = require("./dataStore");

test("book fields map between the stable API shape and PostgreSQL columns", () => {
  const row = toDatabaseBook({ title: "A title", coverImageUrl: "/cover.webp" });
  assert.deepEqual(row, { title: "A title", cover_image_url: "/cover.webp" });

  assert.deepEqual(
    fromDatabaseBook({
      id: "book-id",
      title: "A title",
      cover_image_url: "/cover.webp",
      created_at: "2026-10-22T00:00:00.000Z",
      updated_at: "2026-10-22T00:00:00.000Z",
    }),
    {
      title: "A title",
      _id: "book-id",
      coverImageUrl: "/cover.webp",
      createdAt: "2026-10-22T00:00:00.000Z",
      updatedAt: "2026-10-22T00:00:00.000Z",
    }
  );
});

test("editor fields map without changing the bcrypt hash", () => {
  assert.deepEqual(
    toDatabaseEditor({
      name: "Chief Editor",
      email: "editor@example.com",
      password: "stored-hash",
    }),
    {
      name: "Chief Editor",
      email: "editor@example.com",
      password_hash: "stored-hash",
    }
  );

  assert.deepEqual(
    fromDatabaseEditor({
      id: "editor-id",
      name: "Chief Editor",
      email: "editor@example.com",
      password_hash: "stored-hash",
      role: "chief_editor",
      created_at: "created",
      updated_at: "updated",
    }),
    {
      name: "Chief Editor",
      email: "editor@example.com",
      role: "chief_editor",
      _id: "editor-id",
      password: "stored-hash",
      createdAt: "created",
      updatedAt: "updated",
    }
  );
});

test("Supabase book creation uses the database-generated ID and maps the response", async () => {
  const calls = [];
  const savedRow = {
    id: "generated-id",
    title: "A title",
    cover_image_url: "/cover.webp",
    created_at: "created",
    updated_at: "updated",
  };
  const query = {
    insert(row) {
      calls.push(["insert", row]);
      return this;
    },
    select(columns) {
      calls.push(["select", columns]);
      return this;
    },
    single() {
      return Promise.resolve({ data: savedRow, error: null });
    },
  };
  const store = createDataStore({
    provider: "supabase",
    client: { from: (table) => (calls.push(["from", table]), query) },
  });

  assert.deepEqual(
    await store.createBook({ title: "A title", coverImageUrl: "/cover.webp" }),
    fromDatabaseBook(savedRow)
  );
  assert.deepEqual(calls, [
    ["from", "books"],
    ["insert", { title: "A title", cover_image_url: "/cover.webp" }],
    ["select", "*"],
  ]);
});

test("Supabase book updates set updated_at and return the mapped row", async () => {
  const calls = [];
  const savedRow = {
    id: "book-id",
    title: "Updated title",
    cover_image_url: "",
    created_at: "created",
    updated_at: "updated",
  };
  const query = {
    update(row) {
      calls.push(["update", row]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    select(columns) {
      calls.push(["select", columns]);
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: savedRow, error: null });
    },
  };
  const store = createDataStore({
    provider: "supabase",
    client: { from: (table) => (calls.push(["from", table]), query) },
  });

  assert.deepEqual(
    await store.updateBook("book-id", { title: "Updated title" }),
    fromDatabaseBook(savedRow)
  );
  assert.equal(calls[0][0], "from");
  assert.equal(calls[1][0], "update");
  assert.equal(calls[1][1].title, "Updated title");
  assert.deepEqual(Object.keys(calls[1][1]).sort(), ["title", "updated_at"]);
  assert.ok(Number.isFinite(Date.parse(calls[1][1].updated_at)));
  assert.deepEqual(calls.slice(2), [
    ["eq", "id", "book-id"],
    ["select", "*"],
  ]);
});

test("Supabase Chief Editor seed writes the password hash column", async () => {
  const calls = [];
  const query = {
    select(columns) {
      calls.push(["select", columns]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
    insert(row) {
      calls.push(["insert", row]);
      return this;
    },
    single() {
      return Promise.resolve({ data: { id: "editor-id" }, error: null });
    },
  };
  const store = createDataStore({
    provider: "supabase",
    client: { from: (table) => (calls.push(["from", table]), query) },
  });

  await store.upsertChiefEditor({
    name: "Chief Editor",
    email: "editor@example.com",
    password: "bcrypt-hash",
  });

  assert.deepEqual(calls, [
    ["from", "editor_accounts"],
    ["select", "id"],
    ["eq", "role", "chief_editor"],
    ["from", "editor_accounts"],
    ["insert", {
      name: "Chief Editor",
      email: "editor@example.com",
      password_hash: "bcrypt-hash",
      role: "chief_editor",
    }],
    ["select", "id"],
  ]);
});

test("Supabase public reads filter published books and preserve title ordering", async () => {
  const calls = [];
  const row = {
    id: "book-id",
    title: "A title",
    status: "published",
    cover_image_url: "",
    created_at: "created",
    updated_at: "updated",
  };
  const query = {
    select(columns) {
      calls.push(["select", columns]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    order(column, options) {
      calls.push(["order", column, options]);
      return Promise.resolve({ data: [row], error: null });
    },
  };
  const store = createDataStore({
    provider: "supabase",
    client: { from: (table) => (calls.push(["from", table]), query) },
  });

  assert.deepEqual(await store.getPublishedBooks(), [fromDatabaseBook(row)]);
  assert.deepEqual(calls, [
    ["from", "books"],
    ["select", "*"],
    ["eq", "status", "published"],
    ["order", "title", { ascending: true }],
  ]);
});

test("Supabase connection fails explicitly when credentials are missing", async () => {
  const store = createDataStore({ provider: "supabase", env: {} });
  await assert.rejects(store.connect(), /SUPABASE_URL and SUPABASE_SECRET_KEY are required/);
});

test("Supabase startup verifies both required tables", async () => {
  const tables = [];
  const client = {
    from(table) {
      tables.push(table);
      return {
        select() {
          return this;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
      };
    },
  };
  const store = createDataStore({ provider: "supabase", client });

  await store.connect();

  assert.deepEqual(tables, ["books", "editor_accounts"]);
});

test("Supabase errors are propagated to callers", async () => {
  const failure = new Error("database unavailable");
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return Promise.resolve({ data: null, error: failure });
    },
  };
  const store = createDataStore({
    provider: "supabase",
    client: { from: () => query },
  });

  await assert.rejects(store.getPublishedBooks(), failure);
});
