"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Books", href: "/books" },
  { label: "About", href: "/#about" },
  { label: "Submissions", href: "/#submissions" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Main navigation"
          className="flex items-center justify-between rounded-full border border-black/[0.08] bg-[#F7F4ED]/95 px-5 py-3 shadow-[0_8px_40px_rgba(17,17,17,0.06)] backdrop-blur-xl md:px-7"
        >
          <Link href="/" className="group flex min-h-12 items-center gap-3" aria-label="Veda Publications home">
            <Image
              src="/veda-publications-logo.png"
              alt=""
              width={64}
              height={64}
              priority
              className="h-14 w-14 shrink-0 object-contain mix-blend-multiply transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
            />
            <span className="hidden sm:block">
              <span className="block font-serif text-[1.05rem] font-semibold leading-none tracking-[0.12em] text-[#111111]">
                VEDA
              </span>
              <span className="mt-1 block text-[0.55rem] font-medium uppercase tracking-[0.28em] text-[#5F5A52]">
                Publications
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-[0.78rem] font-medium tracking-wide text-[#3D3D3D] hover:bg-black/[0.05] hover:text-[#111111]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/admin/login"
              className="rounded-full px-3 py-2 text-[0.78rem] font-medium text-[#3D3D3D] hover:text-[#681F2A]"
            >
              Chief Editor
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#681F2A]"
            >
              Browse books <span aria-hidden="true">→</span>
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#6B675F] text-[#111111] hover:bg-black/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span aria-hidden="true" className="text-xl">{menuOpen ? "×" : "☰"}</span>
          </button>
        </nav>

        <div
          id="mobile-navigation"
          hidden={!menuOpen}
          className="mt-2 rounded-3xl border border-[#6B675F] bg-[#F7F4ED] p-3 shadow-xl md:hidden"
        >
            {[...navigationItems, { label: "Chief Editor", href: "/admin/login" }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block min-h-11 rounded-2xl px-4 py-3 text-sm font-medium text-[#3D3D3D] hover:bg-black/[0.05] hover:text-[#681F2A]"
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
      </header>
    </>
  );
}
