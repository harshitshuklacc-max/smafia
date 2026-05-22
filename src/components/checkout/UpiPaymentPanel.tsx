"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Copy, ExternalLink, Smartphone } from "lucide-react";

type UpiPaymentPanelProps = {
  orderNumber: string;
  amount: number;
  trackingCode: string;
};

export function UpiPaymentPanel({ orderNumber, amount, trackingCode }: UpiPaymentPanelProps) {
  const [qr, setQr] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("7587555558-2@ybl");
  const [upiUrl, setUpiUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(
      `/api/payments/upi-qr?amount=${amount}&orderNumber=${encodeURIComponent(orderNumber)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.qrDataUrl) setQr(d.qrDataUrl);
        if (d.upiId) setUpiId(d.upiId);
        if (d.upiUrl) setUpiUrl(d.upiUrl);
      });
  }, [amount, orderNumber]);

  function copyUpi() {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass mx-auto mt-8 max-w-lg rounded-3xl border border-sm-neon/30 p-8 text-center">
      <Smartphone className="mx-auto h-10 w-10 text-sm-neon" />
      <h2 className="mt-4 text-2xl font-black">PAY WITH UPI</h2>
      <p className="mt-2 text-sm text-white/60">
        Scan QR — payment goes directly to SHOE MAFIA
      </p>
      <p className="mt-4 text-3xl font-bold text-sm-neon">{formatPrice(amount)}</p>
      <p className="text-xs text-white/40">Order {orderNumber}</p>

      {qr ? (
        <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4">
          <Image src={qr} alt="UPI QR Code" width={280} height={280} unoptimized />
        </div>
      ) : (
        <div className="mx-auto mt-6 h-[280px] w-[280px] animate-pulse rounded-2xl bg-white/10" />
      )}

      <p className="mt-6 text-sm font-medium">{upiId}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={copyUpi} className="btn-ghost flex items-center gap-2 text-sm">
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy UPI ID"}
        </button>
        {upiUrl && (
          <a href={upiUrl} className="btn-primary flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            Open in UPI App
          </a>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-white/50">
        After payment, your order will be confirmed by our team. Mention order ID in payment note if
        asked. Track: <span className="text-sm-accent">{trackingCode}</span>
      </p>
      <a href={`/track?code=${trackingCode}`} className="btn-ghost mt-4 inline-flex text-sm">
        Track Order →
      </a>
    </div>
  );
}
