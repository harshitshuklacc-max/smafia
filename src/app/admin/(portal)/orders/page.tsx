"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { io } from "socket.io-client";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  guestName: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
};

const statuses = ["PENDING", "ACCEPTED", "REJECTED", "PACKED", "SHIPPED", "DELIVERED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
  }

  useEffect(() => {
    load();
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    socket.on("order:update", () => load());
    return () => socket.disconnect();
  }, []);

  async function updateStatus(id: string, status: string, paymentStatus?: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-3xl font-black">ORDERS</h1>
      <p className="mt-1 text-white/50">Real-time order management</p>
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="glass rounded-2xl p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-sm text-white/50">{o.guestName}</p>
                <p className="mt-1 text-xs text-white/40">
                  {o.paymentMethod?.toUpperCase()} · {o.paymentStatus}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm-neon font-bold">{formatPrice(o.total)}</p>
                <p className="text-sm">{o.status}</p>
              </div>
            </div>
            {o.paymentStatus === "awaiting_upi" && (
              <button
                onClick={() => updateStatus(o.id, "ACCEPTED", "paid")}
                className="mt-3 rounded-lg bg-sm-neon px-4 py-2 text-sm font-bold text-black"
              >
                ✓ UPI received — confirm payment
              </button>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id, s)}
                  className={`rounded-lg px-3 py-1 text-xs ${
                    o.status === s ? "bg-sm-neon text-black" : "bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-white/50">No orders yet</p>}
      </div>
    </div>
  );
}
