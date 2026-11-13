import Image from "next/image";
import Link from "next/link";
import {
  BOOK_CONTACT_EMAIL,
  PUBLISHER_PHONE_NUMBERS,
  getWhatsAppContactHref,
} from "@/lib/bookContact";

export default function Footer() {
  const whatsappHref = getWhatsAppContactHref("Hello, I would like to contact Veda Publications.");

  return (
    <footer className="bg-[#111111] px-6 pb-8 pt-16 text-[#F7F4ED] lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex min-h-12 items-center gap-3" aria-label="Veda Publications home">
              <Image
                src="/veda-publications-logo.png"
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 rounded-lg bg-white p-1 object-contain sm:h-[4.5rem] sm:w-[4.5rem]"
              />
              <span>
                <span className="block font-serif text-lg font-semibold tracking-[0.12em]">VEDA</span>
                <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.28em] text-white/55">Publications</span>
              </span>
            </Link>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
              Browse the published catalogue or contact Veda Publications with a book or manuscript enquiry.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B9975B]">Contact</h2>
            <a
              href={`mailto:${BOOK_CONTACT_EMAIL}`}
              className="mt-5 inline-block text-sm text-white underline decoration-white/30 underline-offset-4 hover:text-[#B9975B]"
            >
              {BOOK_CONTACT_EMAIL}
            </a>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {PUBLISHER_PHONE_NUMBERS.map((phone) => (
                <a key={phone.href} href={phone.href} className="text-sm text-white underline decoration-white/30 underline-offset-4 hover:text-[#B9975B]">
                  {phone.label}
                </a>
              ))}
            </div>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-white underline decoration-white/30 underline-offset-4 hover:text-[#B9975B]">
                WhatsApp the publisher
              </a>
            ) : (
              <p className="mt-3 text-sm text-white/75">WhatsApp contact will be listed here when provided.</p>
            )}
            <Link href="/books" className="mt-5 inline-block text-sm text-white underline decoration-white/30 underline-offset-4 hover:text-[#B9975B]">
              Browse books
            </Link>
          </div>
        </div>
        <p className="pt-6 text-xs text-white/50">© {new Date().getFullYear()} Veda Publications.</p>
      </div>
    </footer>
  );
}
