require("dotenv").config();

const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");
const Book = require("../src/models/Book");
const User = require("../src/models/User");

const execute = process.argv.includes("--execute");
const backupConfirmed = process.argv.includes("--backup-confirmed");
const chunkSize = 500;
const bookColumns = [
  "id",
  "title",
  "author",
  "category",
  "isbn",
  "synopsis",
  "abstract",
  "cover_image_url",
  "status",
  "created_at",
  "updated_at",
];

const toIso = (value) => new Date(value).toISOString();

const mapMongoBook = (book) => ({
  id: String(book._id),
  title: book.title,
  author: book.author || "",
  category: book.category || "",
  isbn: book.isbn || "",
  synopsis: book.synopsis || "",
  abstract: book.abstract || "",
  cover_image_url: book.coverImageUrl || "",
  status: book.status,
  created_at: toIso(book.createdAt),
  updated_at: toIso(book.updatedAt),
});

const mapMongoEditor = (editor) => ({
  id: String(editor._id),
  name: editor.name,
  email: editor.email.trim().toLowerCase(),
  password_hash: editor.password,
  role: editor.role,
  created_at: toIso(editor.createdAt),
  updated_at: toIso(editor.updatedAt),
});

const canonicalBook = (book) => ({
  ...book,
  created_at: toIso(book.created_at),
  updated_at: toIso(book.updated_at),
});

const canonicalEditor = (editor) => ({
  ...editor,
  created_at: toIso(editor.created_at),
  updated_at: toIso(editor.updated_at),
});

const fetchAll = async (client, table, columns) => {
  const rows = [];
  for (let offset = 0; ; offset += chunkSize) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .order("id", { ascending: true })
      .range(offset, offset + chunkSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < chunkSize) return rows;
  }
};

const duplicateIsbns = (books) => {
  const counts = new Map();
  for (const book of books) {
    if (book.isbn) counts.set(book.isbn, (counts.get(book.isbn) || 0) + 1);
  }
  return [...counts.values()].filter((count) => count > 1).length;
};

const validateSnapshot = (books, editors) => {
  const ids = new Set();
  for (const book of books) {
    const row = mapMongoBook(book);
    if (
      !row.title ||
      row.title.length > 200 ||
      row.author.length > 200 ||
      row.category.length > 100 ||
      row.isbn.length > 32 ||
      row.synopsis.length > 500 ||
      row.abstract.length > 12000 ||
      row.cover_image_url.length > 1000 ||
      !["published", "draft"].includes(row.status)
    ) {
      throw new Error(`Book ${row.id} does not satisfy the target schema. No rows were imported.`);
    }
    if (ids.has(row.id)) throw new Error(`Duplicate Mongo book ID ${row.id}. No rows were imported.`);
    ids.add(row.id);
  }
  if (editors.length > 1) {
    throw new Error("Mongo contains multiple Chief Editor accounts; resolve this before migration.");
  }
  for (const editor of editors) {
    const row = mapMongoEditor(editor);
    if (
      !row.name ||
      row.name.length > 200 ||
      !row.email ||
      row.email.length > 254 ||
      !row.password_hash ||
      row.role !== "chief_editor"
    ) {
      throw new Error(`Chief Editor ${row.id} does not satisfy the target schema. No rows were imported.`);
    }
  }
};

const migrate = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (execute && !backupConfirmed) {
    throw new Error("Create and verify a Mongo backup before using --execute --backup-confirmed.");
  }
  if (execute && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for execution.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const [mongoBooks, mongoEditors] = await Promise.all([
      Book.find({}).lean(),
      User.find({ role: "chief_editor" }).lean(),
    ]);
    validateSnapshot(mongoBooks, mongoEditors);

    if (!execute) {
      const published = mongoBooks.filter((book) => book.status === "published").length;
      const sourceIsbns = new Set(
        require("../data/books.json").map((book) => book.isbn).filter(Boolean)
      );
      const mongoIsbns = new Set(mongoBooks.map((book) => book.isbn).filter(Boolean));
      const missingSourceBooks = [...sourceIsbns].filter((isbn) => !mongoIsbns.has(isbn)).length;
      console.log(JSON.stringify({
        mode: "dry-run",
        mongoBooks: mongoBooks.length,
        publishedBooks: published,
        draftBooks: mongoBooks.length - published,
        chiefEditorAccounts: mongoEditors.length,
        duplicateIsbnGroups: duplicateIsbns(mongoBooks),
        suppliedCatalogBooksMissingFromMongo: missingSourceBooks,
        executionRequired: "--execute --backup-confirmed",
      }, null, 2));
      return;
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const [existingBooks, existingEditors] = await Promise.all([
      fetchAll(supabase, "books", "id"),
      fetchAll(supabase, "editor_accounts", "id"),
    ]);
    const mongoBookIds = new Set(mongoBooks.map((book) => String(book._id)));
    const mongoEditorIds = new Set(mongoEditors.map((editor) => String(editor._id)));
    if (existingBooks.some((book) => !mongoBookIds.has(book.id))) {
      throw new Error("Supabase contains book IDs absent from Mongo. No rows were imported.");
    }
    if (existingEditors.some((editor) => !mongoEditorIds.has(editor.id))) {
      throw new Error("Supabase contains editor IDs absent from Mongo. No rows were imported.");
    }

    const { error: schemaError } = await supabase.from("books").select("id").limit(1);
    if (schemaError) throw new Error(`Supabase schema preflight failed: ${schemaError.message}`);

    for (const book of mongoBooks) {
      const row = mapMongoBook(book);
      const { error } = await supabase.from("books").upsert(row, { onConflict: "id" });
      if (error) throw new Error(`Book ${row.id} import failed: ${error.message}`);
    }
    for (const editor of mongoEditors) {
      const row = mapMongoEditor(editor);
      const { error } = await supabase.from("editor_accounts").upsert(row, { onConflict: "id" });
      if (error) throw new Error(`Chief Editor ${row.id} import failed: ${error.message}`);
    }

    const [targetBooks, targetEditors] = await Promise.all([
      fetchAll(supabase, "books", bookColumns),
      fetchAll(supabase, "editor_accounts", "id,name,email,password_hash,role,created_at,updated_at"),
    ]);
    const expectedBooks = mongoBooks.map(mapMongoBook).sort((a, b) => a.id.localeCompare(b.id));
    const receivedBooks = targetBooks.map(canonicalBook).sort((a, b) => a.id.localeCompare(b.id));
    const expectedEditors = mongoEditors.map(mapMongoEditor).sort((a, b) => a.id.localeCompare(b.id));
    const receivedEditors = targetEditors.map(canonicalEditor).sort((a, b) => a.id.localeCompare(b.id));

    if (JSON.stringify(expectedBooks) !== JSON.stringify(receivedBooks)) {
      throw new Error("Book data verification failed. Mongo remains unchanged; investigate before cutover.");
    }
    if (JSON.stringify(expectedEditors) !== JSON.stringify(receivedEditors)) {
      throw new Error("Editor data verification failed. Mongo remains unchanged; investigate before cutover.");
    }
    console.log(`Verified ${targetBooks.length} book rows and ${targetEditors.length} Chief Editor rows.`);
  } finally {
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  console.error("Mongo-to-Supabase migration failed:", error.message);
  process.exitCode = 1;
});
