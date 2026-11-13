"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import API_URL from "@/lib/api";
import { hasDistinctSynopsis } from "@/lib/bookText";
import { getBookContactHref, getWhatsAppContactHref } from "@/lib/bookContact";

type Book = {
  _id: string;
  title: string;
  author?: string;
  category?: string;
  isbn?: string;
  coverImageUrl?: string;
  synopsis?: string;
  abstract?: string;
};

const categoryBackgrounds = ["#E9DDCB", "#D8E5DF", "#E4DDEE", "#E9E2CB", "#DBE4EA"];

export default function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const abstractDialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const abstractCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const lastBookTriggerRef = useRef<HTMLElement | null>(null);
  const abstractOpenRef = useRef(false);

  useEffect(() => {
    abstractOpenRef.current = selectedBook !== null;
  }, [selectedBook]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/books`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load books.");
        }
        setBooks(data.books);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") return;
        setError("The catalogue is temporarily unavailable. Please try again shortly.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const grouped = new Map<string, Book[]>();
    for (const book of books) {
      const name = book.category?.trim() || "Other books";
      grouped.set(name, [...(grouped.get(name) ?? []), book]);
    }
    return [...grouped.entries()].sort(([first], [second]) => {
      if (first === "Other books") return 1;
      if (second === "Other books") return -1;
      return first.localeCompare(second);
    });
  }, [books]);

  const categoryBooks = categories.find(([name]) => name === selectedCategory)?.[1] ?? [];

  useEffect(() => {
    if (!selectedCategory) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (abstractOpenRef.current) {
          setSelectedBook(null);
          return;
        }
        setSelectedCategory(null);
        return;
      }
      if (abstractOpenRef.current) return;
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedBook) return;

    abstractCloseButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBook(null);
        return;
      }
      if (event.key !== "Tab" || !abstractDialogRef.current) return;

      const focusable = abstractDialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      document.removeEventListener("keydown", handleKeyDown);
      lastBookTriggerRef.current?.focus();
    };
  }, [selectedBook]);

  const openCategory = (name: string, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger;
    setSelectedCategory(name);
  };
  const selectedBookWhatsAppHref = selectedBook
    ? getWhatsAppContactHref(
        `Hello, I would like to ask about "${selectedBook.title}"${selectedBook.author ? ` by ${selectedBook.author}` : ""}.`
      )
    : "";

  return (
    <section aria-labelledby="collection-heading" className="bg-[#F7F4ED] px-6 py-16 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#111111]/10 pb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2A]">Explore by subject</p>
            <h2 id="collection-heading" className="mt-3 font-serif text-3xl sm:text-4xl">
              Books from Veda Publications
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5F5A52]">
              Discover a collection, then browse every title in that category.
            </p>
          </div>
          <Link
            href="/books"
            className="inline-flex min-h-11 items-center rounded-full border border-[#6B675F] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:border-[#681F2A] hover:text-[#681F2A]"
          >
            Browse all books
          </Link>
        </div>

        {loading && <p role="status" className="py-10 text-sm text-[#5F5A52]">Loading catalogue…</p>}
        {!loading && error && <p role="alert" className="py-8 text-sm text-[#681F2A]">{error}</p>}
        {!loading && !error && categories.length === 0 && (
          <p className="py-8 text-sm text-[#5F5A52]">Published titles will appear here when available.</p>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(([name, categoryBooks], categoryIndex) => {
              const previewBooks = categoryBooks.slice(0, 3);
              const rotations = [-7, 0, 7];
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={`Browse ${name}, ${categoryBooks.length} ${categoryBooks.length === 1 ? "book" : "books"}`}
                  aria-haspopup="dialog"
                  onClick={(event) => openCategory(name, event.currentTarget)}
                  className="group relative flex min-h-72 cursor-pointer flex-col overflow-hidden rounded-sm p-5 text-left text-[#211E1A] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#681F2A] motion-reduce:transform-none motion-reduce:transition-none sm:min-h-80 sm:p-6"
                  style={{ backgroundColor: categoryBackgrounds[categoryIndex % categoryBackgrounds.length] }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#5F5A52]">
                      Veda collection
                    </span>
                    <span className="text-xs text-[#5F5A52]">
                      {categoryBooks.length} {categoryBooks.length === 1 ? "title" : "titles"}
                    </span>
                  </span>
                  <span aria-hidden="true" className="relative mt-5 flex min-h-48 flex-1 items-center justify-center sm:min-h-52">
                    {previewBooks.map((book, bookIndex) => (
                      <span
                        key={book._id}
                        className="relative -ml-3 block aspect-[3/4] w-[34%] max-w-40 overflow-hidden bg-[#F7F4ED] shadow-[0_8px_18px_rgba(17,17,17,0.2)] first:ml-0"
                        style={{
                          transform: `rotate(${rotations[bookIndex]}deg)`,
                          zIndex: bookIndex + 1,
                        }}
                      >
                        {book.coverImageUrl ? (
                          <Image
                            src={book.coverImageUrl}
                            alt=""
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 25vw, 140px"
                            className="object-contain"
                          />
                        ) : (
                          <span className="flex h-full items-end bg-[#681F2A] p-2 text-left font-serif text-[0.65rem] leading-tight text-white">
                            {book.title}
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                  <span className="mt-4 flex items-end justify-between gap-4 border-t border-[#211E1A]/20 pt-4">
                    <span className="font-serif text-2xl leading-tight sm:text-3xl">{name}</span>
                    <span aria-hidden="true" className="shrink-0 text-xl transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedCategory && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
          aria-hidden={selectedBook !== null}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !abstractOpenRef.current) setSelectedCategory(null);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal={selectedBook === null}
            aria-labelledby="category-dialog-title"
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F7F4ED] shadow-2xl sm:max-w-5xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-[#111111]/10 p-5 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#681F2A]">Veda collection</p>
                <h2 id="category-dialog-title" className="mt-2 font-serif text-3xl sm:text-4xl">
                  {selectedCategory}
                </h2>
                <p className="mt-2 text-sm text-[#5F5A52]">
                  {categoryBooks.length} {categoryBooks.length === 1 ? "book" : "books"} in this category
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSelectedCategory(null)}
                aria-label="Close category books"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#6B675F] text-xl hover:bg-black/[0.05]"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <ul className="grid gap-5">
                {categoryBooks.map((book) => (
                  <li key={book._id} className="flex min-w-0 flex-col gap-5 rounded-xl border border-[#6B675F]/50 bg-white/60 p-5 sm:flex-row sm:items-stretch sm:gap-7 sm:p-6">
                    <div className="relative mx-auto aspect-[3/4] w-40 shrink-0 overflow-hidden bg-[#EDE8DD] shadow-sm sm:mx-0 sm:w-44">
                      {book.coverImageUrl ? (
                        <Image
                          src={book.coverImageUrl}
                          alt={`Front cover of ${book.title}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 160px, 176px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex h-full items-end bg-[#681F2A] p-2 font-serif text-xs leading-tight text-white">
                          {book.title}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start py-1">
                      <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{book.title}</h3>
                      {book.author && <p className="mt-3 text-base leading-7 text-[#5F5A52]">{book.author}</p>}
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          lastBookTriggerRef.current = event.currentTarget;
                          setSelectedBook(book);
                        }}
                        className="mt-5 inline-flex min-h-11 items-center text-base font-semibold text-[#681F2A] underline underline-offset-4 hover:text-[#42131A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A] sm:mt-auto"
                      >
                        View abstract
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}

      {selectedBook && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedBook(null);
          }}
        >
          <section
            ref={abstractDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="featured-abstract-title"
            aria-describedby="featured-abstract-content"
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
                {selectedBook.category && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#681F2A]">{selectedBook.category}</p>
                )}
                <h2 id="featured-abstract-title" className="mt-3 font-serif text-3xl sm:text-4xl">{selectedBook.title}</h2>
                {selectedBook.author && <p className="mt-2 text-sm text-[#5F5A52]">{selectedBook.author}</p>}
              </div>
              <button
                ref={abstractCloseButtonRef}
                type="button"
                onClick={() => setSelectedBook(null)}
                aria-label="Close book abstract"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#6B675F] text-xl hover:bg-[#111111]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
              >
                ×
              </button>
            </div>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#681F2A]">Abstract</p>
              <div id="featured-abstract-content" className="mt-3 whitespace-pre-line text-sm leading-7 text-[#3D3D3D]">
                {selectedBook.abstract || "An abstract for this title will be available soon."}
              </div>
            </div>
            {hasDistinctSynopsis(selectedBook.abstract, selectedBook.synopsis) && (
              <div className="mt-6 border-l-2 border-[#B9975B] pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#681F2A]">Synopsis</p>
                <p className="mt-2 text-sm leading-6 text-[#5F5A52]">{selectedBook.synopsis}</p>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#111111]/10 pt-6">
              <a
                href={getBookContactHref({
                  title: selectedBook.title,
                  author: selectedBook.author ?? "",
                  isbn: selectedBook.isbn,
                })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#681F2A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#521821] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
              >
                <Mail aria-hidden="true" className="size-4" />
                Contact about this book
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              {selectedBookWhatsAppHref && (
                <a
                  href={selectedBookWhatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#6B675F] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#681F2A] hover:border-[#681F2A] hover:bg-[#681F2A]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
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
    </section>
  );
}
