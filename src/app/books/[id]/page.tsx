import { redirect } from "next/navigation";

export default function LegacyBookDetailPage() {
  redirect("/books");
}
