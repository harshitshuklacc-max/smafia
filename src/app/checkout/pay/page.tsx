"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UpiQrPayment } from "@/components/payments/UpiQrPayment";

function PayContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const amount = Number(params.get("amount") || 0);

  if (!orderNumber || !amount) {
    return (
      <div className="py-32 text-center">
        <p>Invalid payment link</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-32 pb-20">
      <UpiQrPayment orderNumber={orderNumber} amount={amount} />
      <div className="mx-auto mt-8 max-w-md text-center">
        <Link href={`/track?code=${orderNumber}`} className="btn-ghost">
          Track order status →
        </Link>
        <p className="mt-4 text-xs text-white/40">
          Questions? WhatsApp us at +91 75875 55558
        </p>
      </div>
    </div>
  );
}

export default function UpiPayPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center">Loading payment...</div>}>
      <PayContent />
    </Suspense>
  );
}
