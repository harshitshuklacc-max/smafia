"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Smartphone, Copy, Check } from "lucide-react";

type UpiQrPaymentProps = {
  orderNumber: string;
  amount: number;
};

export function UpiQrPayment({ orderNumber, amount }: UpiQrPaymentProps) {
  const [qr, setQr] = useState<string | null>(null);
  const [vpa, setVpa] = useState("7587555558-2@ybl");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/upi-qr?orderNumber=${encodeURIComponent(orderNumber)}&amount=${amount}`)
      .then((r) => r.json())
      .then((data) => {
        setQr(data.qrDataUrl);
        setVpa(data.vpa);
        setLoading(false);
      });
  }, [orderNumber, amount]);

  async function copyVpa() {
    await navigator.clipboard.writeText(vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
      <Smartphone className="mx-auto h-10 w-10 text-sm-neon" />
      <h2 className="mt-4 text-2xl font-black">PAY WITH UPI</h2>
      <p className="mt-2 text-3xl font-bold text-sm-neon">{formatPrice(amount)}</p>
      <p className="mt-1 text-sm text-white/50">Order {orderNumber}</p>

      <div className="mx-auto mt-8 flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-white p-4">
        {loading ? (
          <p className="text-sm text-black/50">Generating QR...</p>
        ) : qr ? (
          <Image src={qr} alt="UPI QR Code" width={260} height={260} unoptimized />
        ) : (
          <p className="text-sm text-red-500">QR failed to load</p>
        )}
      </div>

      <p className="mt-6 text-sm text-white/70">
        Scan with <strong>GPay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong>
      </p>
      <p className="mt-2 text-xs text-white/40">Payment goes directly to SHOE MAFIA</p>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3">
        <span className="font-mono text-sm text-sm-neon">{vpa}</span>
        <button
          type="button"
          onClick={copyVpa}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Copy UPI ID"
        >
          {copied ? <Check className="h-4 w-4 text-sm-neon" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-6 text-xs text-amber-400/90">
        After paying, your order will be confirmed once payment is verified. Keep your UPI receipt.
      </p>
    </div>
  );
}
