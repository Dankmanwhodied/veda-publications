const configuredEmail = process.env.NEXT_PUBLIC_PUBLISHER_EMAIL?.trim();

export const BOOK_CONTACT_EMAIL = configuredEmail || "jwsasikanth@gmail.com";

export const PUBLISHER_WHATSAPP =
  process.env.NEXT_PUBLIC_PUBLISHER_WHATSAPP || "+91 9985200048";

export const PUBLISHER_PHONE_NUMBERS = [
  { label: "+91 99852 00048", href: "tel:+919985200048" },
  { label: "99488 50996", href: "tel:+919948850996" },
];

export function getBookContactHref(book: {
  title: string;
  author: string;
  isbn?: string;
}) {
  const subject = `Book enquiry: ${book.title}`;
  const body = [
    "Hello,",
    "",
    "I would like to enquire about ordering this book:",
    `Title: ${book.title}`,
    `Author: ${book.author}`,
    ...(book.isbn ? [`ISBN: ${book.isbn}`] : []),
    "",
    "Please let me know how to proceed.",
  ].join("\n");

  return `mailto:${BOOK_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getWhatsAppContactHref(message: string) {
  const phone = PUBLISHER_WHATSAPP.replace(/\D/g, "");
  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : "";
}
