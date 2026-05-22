"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const steps = ["PENDING", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"];

function TrackContent() {
  const params = useSearchParams();
  const code = params.get("code") || "";
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [input, setInput] = useState(code);

  async function track(c?: string) {
    const q = c || input;
    if (!q) return;
    const res = await fetch(`/api/orders/${q}`);
    if (res.ok) setOrder(await res.json());
    else setOrder(null);
  }

  useEffect(() => {
    if (code) track(code);
  }, [code]);

  const status = (order?.status as string) || "";
  const stepIndex = steps.indexOf(status);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-xl px-6">
        <h1 className="text-4xl font-black tracking-[0.15em]">TRACK ORDER</h1>
        <div className="mt-8 flex gap-2">
          <input
            placeholder="Order / Tracking code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => track()} className="btn-primary shrink-0">
            Track
          </button>
        </div>
        {order && (
          <div className="glass mt-8 rounded-3xl p-8">
            <p className="text-sm text-white/50">Order #{order.orderNumber as string}</p>
            <p className="mt-2 text-2xl font-bold text-sm-neon">{status}</p>
            <div className="mt-8 flex justify-between">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${i <= stepIndex ? "bg-sm-neon" : "bg-white/20"}`}
                  />
                  <span className="mt-2 text-[8px] tracking-wider">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
