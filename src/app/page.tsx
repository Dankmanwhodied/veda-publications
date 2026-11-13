import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import FeaturedBooks from "@/components/books/FeaturedBooks";
import Footer from "@/components/footer/Footer";
import HeroBookSplash from "@/components/home/HeroBookSplash";
import {
  BOOK_CONTACT_EMAIL,
  PUBLISHER_PHONE_NUMBERS,
  getWhatsAppContactHref,
} from "@/lib/bookContact";

export default function Home() {
  const whatsappHref = getWhatsAppContactHref(
    "Hello, I would like to ask Veda Publications about submitting a manuscript."
  );

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-[#F7F4ED] px-6 pb-20 pt-36 lg:px-10">
        <HeroBookSplash />
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-[#B9975B]/10 blur-3xl" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px]">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#681F2A]">
            Veda Publications
          </p>
          <h1 className="max-w-4xl font-serif text-6xl leading-[0.98] tracking-[-0.04em] text-[#111111] sm:text-7xl lg:max-w-[58%] lg:text-8xl">
            A catalogue of <span className="text-[#681F2A] italic">published books.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-[#5F5A52] sm:text-lg lg:max-w-[48%]">
            Browse titles from Veda Publications, read book abstracts, and contact the publisher with a question or enquiry.
          </p>
          <Link
            href="/books"
            className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[#111111] px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#681F2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#681F2A]"
          >
            Explore the catalogue <span aria-hidden="true" className="ml-3">→</span>
          </Link>
          <Link
            href="/#about"
            className="ml-4 inline-flex min-h-12 items-center justify-center rounded-full border border-[#6B675F] px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] hover:border-[#681F2A] hover:text-[#681F2A]"
          >
            About Veda
          </Link>
        </div>
      </section>

      <FeaturedBooks />

      <section id="about" className="scroll-mt-28 bg-[#EDE8DD] px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2A]">About Veda Publications</p>
          <div className="mt-8 grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-16 lg:gap-24">
            <div>
              <h2 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
                Ideas, scholarship, and stories worth sharing.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#3D3D3D]">
                Veda Publications brings together scholarly and literary books across linguistics, English language, literature, drama, education, history, poetry, and science. Explore the catalogue to discover each title, read its abstract, and contact the publisher directly with questions or enquiries.
              </p>

              <div className="mt-10 border-t border-[#6B675F]/40 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#681F2A]">The publisher</p>
                <h3 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                  Dr Kambham John Wesley Sasikanth
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#3D3D3D]">
                  Dr Sasikanth’s work brings together pastoral ministry, teaching, and editorial leadership. He serves as Pastor at Calvary Sakthi Church and Faith and Deeds Ministries, and as Associate Professor of English at VVIT University, Nambur.
                </p>
                <ul className="mt-5 space-y-2 text-sm leading-6 text-[#3D3D3D]">
                  <li><span className="font-semibold text-[#111111]">Editor-in-Chief:</span> Biblical Studies Journal (BSJ)</li>
                  <li><span className="font-semibold text-[#111111]">Editor:</span> Calvary Sakthi Magazine</li>
                </ul>
              </div>

              <blockquote className="mt-8 border-l-2 border-[#681F2A] pl-5 font-serif text-xl italic leading-8 text-[#4B612E]">
                “Trust in the LORD with all your heart” <span className="not-italic">— Proverbs 3:5</span>
              </blockquote>

              <div className="mt-9 rounded-xl border border-[#6B675F]/40 bg-[#F7F4ED]/70 p-5 sm:p-6">
                <h3 className="font-serif text-2xl">Contact the publisher</h3>
                <div className="mt-5 space-y-4">
                  <a
                    href={`mailto:${BOOK_CONTACT_EMAIL}`}
                    className="flex min-h-12 items-center gap-3 text-[#681F2A] hover:text-[#42131A]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#681F2A]/10">
                      <Mail aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#5F5A52]">Email</span>
                      <span className="break-all font-medium underline decoration-[#681F2A]/40 underline-offset-4">{BOOK_CONTACT_EMAIL}</span>
                    </span>
                  </a>
                  <div className="flex min-h-12 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#681F2A]/10 text-[#681F2A]">
                      <Phone aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#5F5A52]">Phone / WhatsApp</span>
                      <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium">
                        {PUBLISHER_PHONE_NUMBERS.map((phone) => (
                          <a key={phone.href} href={phone.href} className="whitespace-nowrap text-[#681F2A] underline decoration-[#681F2A]/40 underline-offset-4 hover:text-[#42131A]">
                            {phone.label}
                          </a>
                        ))}
                      </span>
                    </span>
                  </div>
                </div>
                <p className="mt-5 flex items-start gap-3 border-t border-[#6B675F]/25 pt-4 text-sm leading-6 text-[#3D3D3D]">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#681F2A]" />
                  <span>#45-9-3, Padavalarevu, Gunadala, Vijayawada, A.P., India. Pin-520004.</span>
                </p>
              </div>
            </div>

            <figure className="relative mx-auto w-full max-w-md md:max-w-none">
              <div className="absolute -inset-3 -rotate-2 rounded-2xl bg-[#681F2A]/10" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(17,17,17,0.18)]">
                <Image
                  src="/dr-kambham-john-wesley-sasikanth.png"
                  alt="Dr Kambham John Wesley Sasikanth"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 40vw"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="mt-4 text-center text-sm font-medium text-[#5F5A52] md:text-left">
                Dr Kambham John Wesley Sasikanth
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="submissions" className="scroll-mt-28 bg-[#681F2A] px-6 py-20 text-[#F7F4ED] lg:px-10">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E8C98D]">For authors</p>
            <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              Have a book idea that belongs on our shelves?
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/85">
              Veda Publications’ catalogue spans linguistics, English language, literature, drama, education, history, poetry, and science. If your work connects with these fields, start a conversation with the publisher about your book proposal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${BOOK_CONTACT_EMAIL}?subject=${encodeURIComponent("Book proposal enquiry")}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F7F4ED] px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#681F2A] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8C98D]"
              >
                <Mail aria-hidden="true" className="size-4" />
                Email a proposal
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8C98D]"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  Ask on WhatsApp
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              )}
            </div>
          </div>

          <aside className="rounded-2xl bg-[#F7F4ED] p-6 text-[#111111] shadow-[0_24px_60px_rgba(17,17,17,0.18)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#681F2A]/10 text-[#681F2A]">
                <BookOpen aria-hidden="true" className="size-5" />
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl">A useful first message</h3>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#5F5A52]">
              A brief introduction helps the publisher understand your project. You might include:
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#3D3D3D]">
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#681F2A]" />Your book’s subject and a short outline</li>
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#681F2A]" />Who you expect will read it</li>
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#681F2A]" />A few words about you and the project’s stage</li>
            </ul>
            <p className="mt-6 border-t border-[#6B675F]/25 pt-5 text-sm leading-6 text-[#5F5A52]">
              This website does not accept manuscript uploads. Please send a brief enquiry first and share a complete manuscript only if requested.
            </p>
          </aside>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 bg-[#EDE8DD] px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
            <div className="pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2A]">Get in touch</p>
              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                Let’s talk about books.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#5F5A52]">
                Questions about a title, an order, or a publishing proposal? Reach Dr Sasikanth directly using whichever contact method works best for you.
              </p>
              <Link
                href="/books"
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#681F2A] underline decoration-[#681F2A]/40 underline-offset-4 hover:text-[#42131A]"
              >
                Explore the catalogue <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[#F7F4ED] p-6 shadow-[0_18px_50px_rgba(35,25,20,0.10)] sm:p-8">
              <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full bg-[#B9975B]/15 blur-3xl" />
              <div className="relative">
                <h3 className="font-serif text-2xl sm:text-3xl">Dr Kambham John Wesley Sasikanth</h3>
                <p className="mt-2 text-sm leading-6 text-[#5F5A52]">Publisher · Veda Publications</p>

                <div className="mt-7 divide-y divide-[#6B675F]/20 border-y border-[#6B675F]/20">
                  <a
                    href={`mailto:${BOOK_CONTACT_EMAIL}`}
                    className="group flex min-h-[76px] items-center gap-4 py-4"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#681F2A]/10 text-[#681F2A] transition-colors group-hover:bg-[#681F2A] group-hover:text-white">
                      <Mail aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6B675F]">Email</span>
                      <span className="mt-1 block break-all font-medium text-[#681F2A] underline decoration-[#681F2A]/30 underline-offset-4">{BOOK_CONTACT_EMAIL}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#6B675F] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>

                  <div className="flex items-start gap-4 py-4">
                    <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-full bg-[#681F2A]/10 text-[#681F2A]">
                      <Phone aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6B675F]">Phone</span>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {PUBLISHER_PHONE_NUMBERS.map((phone) => (
                          <a key={phone.href} href={phone.href} className="whitespace-nowrap font-medium text-[#681F2A] underline decoration-[#681F2A]/30 underline-offset-4 hover:text-[#42131A]">
                            {phone.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex min-h-[76px] items-center gap-4 py-4"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#681F2A]/10 text-[#681F2A] transition-colors group-hover:bg-[#681F2A] group-hover:text-white">
                        <MessageCircle aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6B675F]">WhatsApp</span>
                        <span className="mt-1 block font-medium text-[#681F2A]">Send a message</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#6B675F] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>

                <p className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#5F5A52]">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#681F2A]" />
                  <span>#45-9-3, Padavalarevu, Gunadala, Vijayawada, A.P., India. Pin-520004.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
