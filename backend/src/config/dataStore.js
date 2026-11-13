const { createClient } = require("@supabase/supabase-js");

const BOOK_FIELD_MAP = {
  coverImageUrl: "cover_image_url",
};

function toDatabaseBook(book) {
  return Object.fromEntries(
    Object.entries(book).map(([key, value]) => [BOOK_FIELD_MAP[key] || key, value])
  );
}

function toDatabaseEditor(editor) {
  const { password, ...fields } = editor;
  return { ...fields, password_hash: password };
}

function fromDatabaseBook(book) {
  if (!book) return null;
  const { id, cover_image_url, created_at, updated_at, ...fields } = book;
  return {
    ...fields,
    _id: id,
    coverImageUrl: cover_image_url,
    createdAt: created_at,
    updatedAt: updated_at,
  };
}

function fromDatabaseEditor(editor) {
  if (!editor) return null;
  const { id, password_hash, created_at, updated_at, ...fields } = editor;
  return {
    ...fields,
    _id: id,
    password: password_hash,
    createdAt: created_at,
    updatedAt: updated_at,
  };
}

function createDataStore({
  provider = process.env.DATABASE_PROVIDER || "mongodb",
  getModels = () => ({
    Book: require("../models/Book"),
    User: require("../models/User"),
  }),
  client: suppliedClient,
  createSupabaseClient = createClient,
  env = process.env,
} = {}) {
  if (!["mongodb", "supabase"].includes(provider)) {
    throw new Error("DATABASE_PROVIDER must be either mongodb or supabase.");
  }

  let client = suppliedClient;
  const getClient = () => {
    if (client) return client;
    if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for Supabase.");
    }
    client = createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    return client;
  };

  const throwIfError = ({ data, error }) => {
    if (error) throw error;
    return data;
  };

  return {
    provider,
    async connect() {
      if (provider === "mongodb") {
        const mongoose = require("mongoose");
        if (!env.MONGODB_URI) throw new Error("MONGODB_URI is required for MongoDB.");
        await mongoose.connect(env.MONGODB_URI);
        return;
      }
      const supabase = getClient();
      const results = await Promise.all([
        supabase.from("books").select("id").limit(1),
        supabase.from("editor_accounts").select("id").limit(1),
      ]);
      for (const { error } of results) {
        if (error) throw error;
      }
    },
    async disconnect() {
      if (provider === "mongodb") {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
      }
    },
    async getPublishedBooks() {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.find({ status: "published" }).sort({ title: 1 });
      }
      const data = throwIfError(
        await getClient().from("books").select("*").eq("status", "published").order("title", { ascending: true })
      );
      return data.map(fromDatabaseBook);
    },
    async getAllBooks() {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.find().sort({ updatedAt: -1 });
      }
      const data = throwIfError(
        await getClient().from("books").select("*").order("updated_at", { ascending: false })
      );
      return data.map(fromDatabaseBook);
    },
    async findBookById(id) {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.findById(id);
      }
      const data = throwIfError(
        await getClient().from("books").select("*").eq("id", id).maybeSingle()
      );
      return fromDatabaseBook(data);
    },
    async createBook(book) {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.create(book);
      }
      const data = throwIfError(
        await getClient().from("books").insert(toDatabaseBook(book)).select("*").single()
      );
      return fromDatabaseBook(data);
    },
    async updateBook(id, book) {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.findByIdAndUpdate(id, book, { new: true, runValidators: true });
      }
      const row = {
        ...toDatabaseBook(book),
        updated_at: new Date().toISOString(),
      };
      const data = throwIfError(
        await getClient().from("books").update(row).eq("id", id).select("*").maybeSingle()
      );
      return fromDatabaseBook(data);
    },
    async deleteBook(id) {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Boolean(await Book.findByIdAndDelete(id));
      }
      const data = throwIfError(
        await getClient().from("books").delete().eq("id", id).select("id").maybeSingle()
      );
      return Boolean(data);
    },
    async upsertBookByIsbn(book) {
      if (provider === "mongodb") {
        const { Book } = getModels();
        return Book.updateOne(
          { isbn: book.isbn },
          {
            $set: book,
            $unset: {
              price: "",
              description: "",
              coverImage: "",
              stock: "",
              isAvailable: "",
              isFeatured: "",
            },
          },
          { upsert: true, runValidators: true, strict: false }
        );
      }
      const supabase = getClient();
      const existing = throwIfError(
        await supabase.from("books").select("id").eq("isbn", book.isbn).maybeSingle()
      );
      const row = {
        ...toDatabaseBook(book),
        ...(existing
          ? { updated_at: new Date().toISOString() }
          : { id: require("node:crypto").randomUUID() }),
      };
      const query = existing
        ? supabase.from("books").update(row).eq("id", existing.id)
        : supabase.from("books").insert(row);
      return throwIfError(await query.select("id").single());
    },
    async findEditorByEmail(email) {
      if (provider === "mongodb") {
        const { User } = getModels();
        return User.findOne({ email });
      }
      const data = throwIfError(
        await getClient().from("editor_accounts").select("*").eq("email", email).maybeSingle()
      );
      return fromDatabaseEditor(data);
    },
    async findEditorById(id) {
      if (provider === "mongodb") {
        const { User } = getModels();
        return User.findById(id).select("name email role");
      }
      const data = throwIfError(
        await getClient().from("editor_accounts").select("id,name,email,role").eq("id", id).maybeSingle()
      );
      return data ? { ...data, _id: data.id } : null;
    },
    async upsertChiefEditor(editor) {
      if (provider === "mongodb") {
        const { User } = getModels();
        await User.collection.createIndex(
          { role: 1 },
          {
            unique: true,
            partialFilterExpression: { role: "chief_editor" },
            name: "one_chief_editor",
          }
        );
        return User.findOneAndUpdate(
          { role: "chief_editor" },
          { $set: { ...editor, role: "chief_editor" } },
          {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
      }
      const supabase = getClient();
      const current = throwIfError(
        await supabase.from("editor_accounts").select("id").eq("role", "chief_editor").maybeSingle()
      );
      const row = { ...toDatabaseEditor(editor), role: "chief_editor" };
      const query = current
        ? supabase.from("editor_accounts")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", current.id)
        : supabase.from("editor_accounts").insert(row);
      return throwIfError(await query.select("id").single());
    },
  };
}

const dataStore = createDataStore();

module.exports = {
  createDataStore,
  dataStore,
  fromDatabaseBook,
  fromDatabaseEditor,
  toDatabaseEditor,
  toDatabaseBook,
};
