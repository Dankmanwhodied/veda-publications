"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, Mail, MessageCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import API_URL from "@/lib/api";
import { hasDistinctSynopsis } from "@/lib/bookText";
import {
  getBookContactHref,
  getWhatsAppContactHref,
} from "@/lib/bookContact";

type Book = {
  _id: string;
  title: string;
  author: string;
  synopsis: string;
  abstract: string;
  category: string;
  isbn?: string;
  coverImageUrl: string;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/books`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load the catalogue.");
        }
        setBooks(data.books);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") return;
        setError("The catalogue could not be loaded. Please try again shortly.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedBook) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBook(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      lastTriggerRef.current?.focus();
    };
  }, [selectedBook]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(books.map((book) => book.category).filter(Boolean))).sort()],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        !query ||
        [book.title, book.author, book.synopsis, book.category]
          .some((value) => value?.toLowerCase().includes(query));
      return matchesSearch && (category === "All" || book.category === category);
    });
  }, [books, category, search]);

  const openAbstract = (book: Book, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger;
    setSelectedBook(book);
  };
  const selectedBookWhatsAppHref = selectedBook
    ? getWhatsAppContactHref(
        `Hello, I would like to ask about "${selectedBook.title}"${selectedBook.author ? ` by ${selectedBook.author}` : ""}${selectedBook.isbn ? ` (ISBN ${selectedBook.isbn})` : ""}.`
      )
    : "";

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#F7F4ED] text-[#111111]">
      <section className="px-6 pb-12 pt-32 sm:pb-16 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#681F2A]">
              The Veda Collection
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-tight tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Books from <span className="text-[#681F2A] italic">Veda.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#6B675F] sm:text-lg">
              Explore books across literature, language, history, science, and more. Search by title, author, or subject, then open a book to read its abstract.
            </p>
          </div>
          <div className="flex items-center gap-3 border-l-2 border-[#B9975B] pl-4 md:mb-2">
            <BookOpen aria-hidden="true" className="size-6 shrink-0 text-[#681F2A]" />
            <div>
              <p className="font-serif text-2xl">{books.length}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B675F]">
                {books.length === 1 ? "Published title" : "Published titles"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Filter catalogue" className="sticky top-28 z-30 border-y border-[#111111]/10 bg-[#F7F4ED]/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 sm:gap-5">
          <div className="relative w-[48%] min-w-32 max-w-[24rem] shrink-0">
            <label htmlFor="catalogue-search" className="sr-only">Search books</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B675F] sm:left-4" />
            <input
              id="catalogue-search"
              type="search"
              placeholder="Search books"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded-full border border-[#6B675F]/60 bg-white/70 py-3 pl-10 pr-3 text-sm outline-none placeholder:text-[#6B675F] focus-visible:border-[#681F2A] focus-visible:ring-2 focus-visible:ring-[#681F2A]/30 sm:pl-11 sm:pr-5"
            />
          </div>
          <div
            role="group"
            aria-label="Book categories. Scroll horizontally to see all categories."
            tabIndex={0}
            className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-1 focus-visible:rounded-lg"
          >
            <div className="flex w-max min-w-full flex-nowrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    category === item
                      ? "bg-[#681F2A] text-white"
                      : "border border-[#6B675F] text-[#5F5A52] hover:border-[#681F2A] hover:text-[#681F2A]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Published books" className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          {loading && <p role="status" className="py-20 text-center text-[#5F5A52]">Loading catalogue…</p>}
          {!loading && error && (
            <div role="alert" className="border border-[#681F2A]/20 bg-[#681F2A]/5 p-6 text-center text-[#681F2A]">
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-3 underline underline-offset-4">
                Reload catalogue
              </button>
            </div>
          )}
          {!loading && !error && filteredBooks.length === 0 && (
            <div className="rounded-2xl border border-[#111111]/10 bg-white/60 px-6 py-20 text-center">
              <Search aria-hidden="true" className="mx-auto size-8 text-[#681F2A]/70" />
              <h2 className="mt-5 font-serif text-3xl">{books.length ? "No books match those filters." : "The catalogue is being prepared."}</h2>
              <p className="mt-3 text-sm text-[#5F5A52]">
                {books.length ? "Try another title, author, or category." : "Please check back soon."}
              </p>
              {books.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setCategory("All"); }}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#681F2A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#521821]"
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear filters
                </button>
              )}
            </div>
          )}
          {!loading && !error && filteredBooks.length > 0 && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#111111]/10 pb-5">
                <p aria-live="polite" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5F5A52]">
                  Showing {filteredBooks.length} {filteredBooks.length === 1 ? "title" : "titles"}
                  {category !== "All" ? ` · ${category}` : ""}
                </p>
                {(search || category !== "All") && (
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setCategory("All"); }}
                    className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#681F2A] underline underline-offset-4 hover:text-[#42131A]"
                  >
                    Clear filters <X aria-hidden="true" className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBooks.map((book) => (
                  <article key={book._id} className="group flex flex-col overflow-hidden rounded-xl border border-[#6B675F]/20 bg-white/65 shadow-[0_8px_24px_rgba(35,25,20,0.04)] transition-shadow duration-300 hover:shadow-[0_18px_36px_rgba(35,25,20,0.12)]">
                    <div className="relative flex aspect-[4/4.5] items-center justify-center overflow-hidden bg-[#EDE8DD] p-5 sm:p-7">
                      {book.coverImageUrl ? (
                        <Image
                          src={book.coverImageUrl}
                          alt={`Front cover of ${book.title}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain drop-shadow-[0_12px_10px_rgba(17,17,17,0.16)] transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                        />
                      ) : (
                        <div className="flex h-[82%] w-[62%] flex-col justify-end bg-[#111111] p-6 text-[#F7F4ED]">
                          <h2 className="font-serif text-2xl">{book.title}</h2>
                          <p className="mt-3 text-xs text-white/70">{book.author}</p>
                        </div>
                      )}
                      {book.category && (
                        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#F7F4ED]/95 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#5F5A52] shadow-sm">
                          {book.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h2 className="font-serif text-2xl leading-tight">{book.title}</h2>
                      {book.author && <p className="mt-2 text-sm leading-6 text-[#5F5A52]">{book.author}</p>}
                      {book.synopsis && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5F5A52]">{book.synopsis}</p>}
                      <button
                        type="button"
                        onClick={(event) => openAbstract(book, event.currentTarget)}
                        className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#681F2A]/50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#681F2A] hover:bg-[#681F2A] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
                      >
                        Read abstract <ArrowRight aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedBook && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedBook(null);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="abstract-title"
            aria-describedby="abstract-content"
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-[#F7F4ED] p-6 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-10"
          >
            <div className="flex items-start gap-5">
              {selectedBook.coverImageUrl && (
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-[#EDE8DD] sm:w-32">
                  <Image
                    src={selectedBook.coverImageUrl}
                    alt={`Front cover of ${selectedBook.title}`}
                    fill
                    unoptimized
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {selectedBook.category && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#681F2A]">{selectedBook.category}</p>}
                <h2 id="abstract-title" className="mt-3 font-serif text-3xl sm:text-4xl">{selectedBook.title}</h2>
                {selectedBook.author && <p className="mt-2 text-sm text-[#5F5A52]">{selectedBook.author}</p>}
                {selectedBook.isbn && <p className="mt-1 text-xs text-[#5F5A52]">ISBN: {selectedBook.isbn}</p>}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSelectedBook(null)}
                aria-label="Close abstract"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#6B675F] text-xl hover:bg-[#111111]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
              >
                ×
              </button>
            </div>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#681F2A]">Abstract</p>
              <div id="abstract-content" className="mt-3 whitespace-pre-line text-sm leading-7 text-[#3D3D3D]">
                {selectedBook.abstract || "An abstract for this title will be available soon."}
              </div>
            </div>
            {hasDistinctSynopsis(selectedBook.abstract, selectedBook.synopsis) && (
              <div className="mt-6 border-l-2 border-[#B9975B] pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#681F2A]">Synopsis</p>
                <p className="mt-2 text-sm leading-6 text-[#5F5A52]">{selectedBook.synopsis}</p>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={getBookContactHref(selectedBook)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#681F2A] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#521821] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
              >
                <Mail aria-hidden="true" className="size-4" />
                Email to enquire about ordering
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              {selectedBookWhatsAppHref && (
                <a
                  href={selectedBookWhatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#6B675F] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] hover:border-[#681F2A] hover:text-[#681F2A]"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  WhatsApp
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
