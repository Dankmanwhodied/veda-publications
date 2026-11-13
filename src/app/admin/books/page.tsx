"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  synopsis: string;
  abstract: string;
  coverImageUrl: string;
  status: "published" | "draft";
};

type BookFields = Omit<Book, "_id">;

const emptyBook: BookFields = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  synopsis: "",
  abstract: "",
  coverImageUrl: "",
  status: "draft",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-[#6B675F] bg-white px-4 py-3 text-sm outline-none focus:border-[#681F2A] focus:ring-2 focus:ring-[#681F2A]/20";
const labelClass = "text-sm font-medium text-[#3D3D3D]";

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<BookFields>(emptyBook);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("veda_editor_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    let active = true;
    const loadEditorData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [identityResponse, booksResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/me`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/api/books/admin`, { headers, cache: "no-store" }),
        ]);

        if (identityResponse.status === 401 || booksResponse.status === 401 || booksResponse.status === 403) {
          sessionStorage.removeItem("veda_editor_token");
          router.replace("/admin/login");
          return;
        }

        const identity = await identityResponse.json();
        const data = await booksResponse.json();
        if (!identityResponse.ok || identity.user?.role !== "chief_editor") {
          throw new Error("This account is not authorized to manage the catalogue.");
        }
        if (!booksResponse.ok || !data.success) {
          throw new Error(data.message || "Unable to load the catalogue.");
        }
        if (active) setBooks(data.books);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the catalogue.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadEditorData();

    return () => {
      active = false;
    };
  }, [router]);

  const resetForm = () => {
    setForm(emptyBook);
    setEditingId("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const token = sessionStorage.getItem("veda_editor_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    if (!form.title.trim()) {
      setError("A book title is required.");
      return;
    }
    if (form.coverImageUrl && !form.coverImageUrl.startsWith("/")) {
      try {
        if (new URL(form.coverImageUrl).protocol !== "https:") {
          setError("Cover images must use an HTTPS URL or a site-relative path.");
          return;
        }
      } catch {
        setError("Enter a valid HTTPS cover URL or site-relative path.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/books${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            author: form.author.trim(),
            category: form.category.trim(),
            isbn: form.isbn.trim(),
          }),
        }
      );
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("veda_editor_token");
        router.replace("/admin/login");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save this book.");
      }

      if (editingId) {
        setBooks((current) => current.map((book) => book._id === editingId ? data.book : book));
        setNotice("Book updated.");
      } else {
        setBooks((current) => [data.book, ...current]);
        setNotice("Book added.");
      }
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save this book.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      isbn: book.isbn || "",
      synopsis: book.synopsis || "",
      abstract: book.abstract || "",
      coverImageUrl: book.coverImageUrl || "",
      status: book.status,
    });
    setEditingId(book._id);
    setError("");
    setNotice("");
    document.getElementById("book-editor-heading")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete “${book.title}” from the catalogue? This cannot be undone.`)) return;

    const token = sessionStorage.getItem("veda_editor_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setDeletingId(book._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/api/books/${book._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("veda_editor_token");
        router.replace("/admin/login");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete this book.");
      }
      setBooks((current) => current.filter((item) => item._id !== book._id));
      if (editingId === book._id) resetForm();
      setNotice("Book deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this book.");
    } finally {
      setDeletingId("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("veda_editor_token");
    router.replace("/admin/login");
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#F7F4ED] px-5 pb-20 pt-32 text-[#111111] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2A]">Chief Editor</p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Catalogue management</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5A52]">
              Create and maintain book records. Only published titles appear in the public catalogue.
            </p>
          </div>
          <button type="button" onClick={handleLogout} className="min-h-11 rounded-full border border-[#6B675F] px-5 py-2 text-sm hover:border-[#681F2A] hover:text-[#681F2A]">
            Sign out
          </button>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-900">{notice}</p>}

        <section className="rounded-2xl border border-[#111111]/10 bg-white/70 p-5 sm:p-8">
          <h2 id="book-editor-heading" className="font-serif text-2xl">{editingId ? "Edit book" : "Add a book"}</h2>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="book-title">Title <span aria-hidden="true">*</span></label>
              <input id="book-title" className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={200} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="book-author">Author</label>
              <input id="book-author" className={inputClass} value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="book-category">Category</label>
              <input id="book-category" className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} maxLength={100} />
            </div>
            <div>
              <label className={labelClass} htmlFor="book-isbn">ISBN</label>
              <input id="book-isbn" className={inputClass} value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} maxLength={32} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="book-cover">Cover image URL or site path</label>
              <input id="book-cover" className={inputClass} value={form.coverImageUrl} onChange={(event) => setForm({ ...form, coverImageUrl: event.target.value })} placeholder="/books/cover.webp" maxLength={1000} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="book-synopsis">Synopsis (up to 500 characters)</label>
              <textarea id="book-synopsis" className={inputClass} value={form.synopsis} onChange={(event) => setForm({ ...form, synopsis: event.target.value })} rows={3} maxLength={500} />
              <p className="mt-1 text-right text-xs text-[#5F5A52]">{form.synopsis.length}/500</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="book-abstract">Abstract (up to 12,000 characters)</label>
              <textarea id="book-abstract" className={inputClass} value={form.abstract} onChange={(event) => setForm({ ...form, abstract: event.target.value })} rows={8} maxLength={12000} />
              <p className="mt-1 text-right text-xs text-[#5F5A52]">{form.abstract.length}/12,000</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="book-status">Publication status</label>
              <select id="book-status" className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BookFields["status"] })}>
                <option value="draft">Draft (not public)</option>
                <option value="published">Published (visible publicly)</option>
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <button type="submit" disabled={submitting} className="min-h-11 rounded-full bg-[#681F2A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#521821] disabled:opacity-60">
                {submitting ? "Saving…" : editingId ? "Save changes" : "Add book"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="min-h-11 rounded-full border border-[#6B675F] px-5 py-3 text-sm hover:border-[#681F2A] hover:text-[#681F2A]">
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-12" aria-labelledby="catalogue-list-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="catalogue-list-heading" className="font-serif text-3xl">Books</h2>
            {!loading && <p className="text-sm text-[#5F5A52]">{books.length} total</p>}
          </div>
          {loading && <p role="status" className="py-10 text-[#5F5A52]">Loading catalogue…</p>}
          {!loading && books.length === 0 && <p className="rounded-xl border border-[#111111]/10 p-6 text-sm text-[#5F5A52]">No books in the catalogue yet.</p>}
          <ul className="divide-y divide-[#111111]/10 rounded-xl border border-[#111111]/10 bg-white/60">
            {books.map((book) => (
              <li key={book._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden bg-[#EDE8DD]">
                    {book.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt="" fill unoptimized sizes="56px" className="object-contain" />
                    ) : (
                      <span className="sr-only">No cover image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl">{book.title}</h3>
                    <p className="mt-1 text-sm text-[#5F5A52]">{book.author || "Author not listed"}{book.category ? ` · ${book.category}` : ""}</p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${book.status === "published" ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}>
                      {book.status}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => handleEdit(book)} className="min-h-11 rounded-full border border-[#6B675F] px-4 text-sm hover:border-[#681F2A] hover:text-[#681F2A]">
                    Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(book)} disabled={Boolean(deletingId)} className="min-h-11 rounded-full border border-red-800 px-4 text-sm text-red-800 hover:bg-red-50 disabled:opacity-60">
                    {deletingId === book._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
