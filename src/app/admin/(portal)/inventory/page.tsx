"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Order = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }

  useEffect(() => {
    // 1. Fire off the baseline data load
    load();
    
    // 2. Initialize connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    
    // 3. Explicit execution scope block ensures NO values leak as implicit returns
    socket.on("order:update", () => {
      load();
    });

    // 4. Clean cleanup closure returning absolutely nothing (void)
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">ORDERS</h1>
          <p className="mt-1 text-white/50">Real-time order tracking</p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="py-3">Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-white/30">
                  No orders found. Waiting for real-time sync...
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5">
                  <td className="py-3 font-mono text-xs">{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span
                      className={`text-sm font-semibold ${
                        order.status === "Delivered" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
