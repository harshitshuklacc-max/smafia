"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Analytics = {
  onlineRevenue: number;
  offlineRevenue: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  chart: { date: string; online: number; offline: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  const maxVal = Math.max(...data.chart.map((d) => d.online + d.offline), 1);

  return (
    <div>
      <h1 className="text-3xl font-black">ANALYTICS</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Online Revenue</p>
          <p className="text-2xl font-black text-sm-neon">{formatPrice(data.onlineRevenue)}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Offline (POS)</p>
          <p className="text-2xl font-black text-sm-accent">{formatPrice(data.offlineRevenue)}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Total</p>
          <p className="text-2xl font-black">{formatPrice(data.totalRevenue)}</p>
        </div>
      </div>

      <div className="glass mt-10 rounded-2xl p-6">
        <h2 className="font-bold">7-Day Sales Chart</h2>
        <div className="mt-8 flex h-48 items-end gap-2">
          {data.chart.map((d) => {
            const total = d.online + d.offline;
            const h = (total / maxVal) * 100;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-sm-neon to-sm-accent"
                  style={{ height: `${Math.max(h, 4)}%` }}
                />
                <span className="text-[9px] text-white/40">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm text-white/40">
        Export PDF/Excel — connect production export service. Data retained 1+ year in database.
      </p>
    </div>
  );
}
