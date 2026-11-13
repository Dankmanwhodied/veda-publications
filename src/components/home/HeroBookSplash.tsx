import Image from "next/image";

const covers = [
  {
    src: "/books/girish-karnad-creative-intellectual.webp",
    className: "left-[31%] top-[12%] z-20 w-[37%] rotate-[-7deg]",
  },
  {
    src: "/books/linguistic-insight-english-hindi.webp",
    className: "left-[5%] top-[25%] z-10 w-[31%] rotate-[-17deg]",
  },
  {
    src: "/books/ai-revolutionizing-physics.webp",
    className: "right-[3%] top-[18%] z-10 w-[30%] rotate-[12deg]",
  },
  {
    src: "/books/found-in-translation.webp",
    className: "left-[15%] bottom-[10%] z-30 w-[32%] rotate-[8deg]",
  },
  {
    src: "/books/the-longing-anthology-poems.webp",
    className: "right-[11%] bottom-[8%] z-20 w-[31%] rotate-[-11deg]",
  },
];

export default function HeroBookSplash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-16 bottom-[-1rem] top-auto h-48 w-48 translate-y-0 opacity-35 sm:right-0 sm:h-60 sm:w-60 sm:opacity-50 md:right-0 md:top-[18%] md:bottom-auto md:h-[74%] md:w-[43%] md:translate-y-0 md:opacity-100"
    >
      <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8D8C8]/70 blur-2xl" />
      <div className="absolute inset-[7%]">
        {covers.map((cover) => (
          <div
            key={cover.src}
            className={`absolute aspect-[3/4] overflow-hidden rounded-[2px] border-[3px] border-white/90 bg-[#F7F4ED] shadow-[0_18px_38px_rgba(35,25,20,0.24)] ${cover.className}`}
          >
            <Image src={cover.src} alt="" fill sizes="(max-width: 768px) 110px, 220px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
