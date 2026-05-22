"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pt-20">
      <form onSubmit={login} className="glass w-full max-w-md rounded-3xl p-8">
        <h1 className="text-center text-3xl font-black">
          SHOE<span className="text-sm-neon">MAFIA</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">Customer account — shop & track orders</p>
        <input name="email" type="email" placeholder="Email" className="mt-8" required />
        <input name="password" type="password" placeholder="Password" className="mt-4" required />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full">
          Sign In
        </button>
        <p className="mt-4 text-center text-sm text-white/50">
          No account? <Link href="/register" className="text-sm-neon">Register</Link>
        </p>
        <p className="mt-4 text-center text-sm text-white/40">
          Store staff?{" "}
          <Link href="/admin/login" className="text-sm-accent hover:text-sm-neon">
            Admin login →
          </Link>
        </p>
      </form>
    </div>
  );
}
