"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });
    if (res.ok) router.push("/");
    else alert("Registration failed");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pt-20">
      <form onSubmit={register} className="glass w-full max-w-md rounded-3xl p-8">
        <h1 className="text-3xl font-black">CREATE ACCOUNT</h1>
        <input name="name" placeholder="Full Name" className="mt-6" required />
        <input name="email" type="email" placeholder="Email" className="mt-4" required />
        <input name="phone" placeholder="Phone" className="mt-4" />
        <input name="password" type="password" placeholder="Password (min 8)" className="mt-4" required minLength={8} />
        <button type="submit" className="btn-primary mt-6 w-full">
          Register
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-sm-neon">Already have an account?</Link>
        </p>
      </form>
    </div>
  );
}
