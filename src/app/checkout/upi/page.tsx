"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UpiPaymentPanel } from "@/components/checkout/UpiPaymentPanel";
import Link from "next/link";

function UpiPayContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const amount = Number(params.get("amount") || 0);
  const tracking = params.get("track") || "";

  if (!orderNumber || !amount) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24">
        <p className="text-white/60">Invalid payment link</p>
        <Link href="/shop" className="btn-primary mt-6">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-28 pb-20">
      <UpiPaymentPanel orderNumber={orderNumber} amount={amount} trackingCode={tracking} />
    </div>
  );
}

export default function UpiCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-24">Loading payment…</div>
      }
    >
      <UpiPayContent />
    </Suspense>
  );
}
