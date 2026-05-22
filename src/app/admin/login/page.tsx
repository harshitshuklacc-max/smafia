"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: form.get("identifier"),
        password: form.get("password"),
      }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid admin credentials");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sm-black px-6">
      <form onSubmit={login} className="glass-strong w-full max-w-md rounded-3xl border border-sm-neon/20 p-8">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm-neon">
          <Shield className="h-6 w-6" />
          <span className="text-xs font-bold tracking-[0.3em] uppercase">Staff Only</span>
        </div>
        <h1 className="text-center text-3xl font-black">
          SHOE<span className="text-sm-neon">MAFIA</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">Admin Portal Login</p>
        <input
          name="identifier"
          placeholder="Admin Username"
          className="mt-8"
          required
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="mt-4"
          required
          autoComplete="current-password"
        />
        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full">
          Sign In to Admin
        </button>
        <p className="mt-6 text-center text-sm text-white/40">
          Customer?{" "}
          <Link href="/login" className="text-sm-accent hover:text-sm-neon">
            Shop login →
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60">
            ← Back to store
          </Link>
        </p>
      </form>
    </div>
  );
}
