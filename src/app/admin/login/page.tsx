"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

export default function ChiefEditorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || data.user?.role !== "chief_editor" || !data.token) {
        throw new Error(data.message || "Unable to sign in.");
      }
      sessionStorage.setItem("veda_editor_token", data.token);
      router.replace("/admin/books");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-[#F7F4ED] px-5 py-32">
      <section className="w-full max-w-md rounded-2xl border border-[#111111]/10 bg-white/70 p-6 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2A]">Veda Publications</p>
        <h1 className="mt-3 font-serif text-4xl">Chief Editor sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#5F5A52]">This restricted area is for the Chief Editor only.</p>

        {error && <p role="alert" className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="editor-email" className="text-sm font-medium">Email</label>
            <input
              id="editor-email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#6B675F] bg-white px-4 py-3 text-sm outline-none focus:border-[#681F2A] focus:ring-2 focus:ring-[#681F2A]/20"
            />
          </div>
          <div>
            <label htmlFor="editor-password" className="text-sm font-medium">Password</label>
            <input
              id="editor-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#6B675F] bg-white px-4 py-3 text-sm outline-none focus:border-[#681F2A] focus:ring-2 focus:ring-[#681F2A]/20"
            />
          </div>
          <button type="submit" disabled={submitting} className="min-h-12 w-full rounded-full bg-[#681F2A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#521821] disabled:opacity-60">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
