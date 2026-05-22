import { STORE } from "./utils";

export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "7587555558-2@ybl";
export const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "SHOE MAFIA";

/** NPCI UPI deep link — opens GPay, PhonePe, Paytm with amount pre-filled */
export function buildUpiPaymentUrl(opts: {
  amount: number;
  orderNumber: string;
  note?: string;
}) {
  const amount = opts.amount.toFixed(2);
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: amount,
    cu: "INR",
    tn: opts.note || `Order ${opts.orderNumber} - ${STORE.name}`,
  });
  return `upi://pay?${params.toString()}`;
}

/** Bharat QR / UPI static payload string for QR encoding */
export function buildUpiQrPayload(opts: {
  amount: number;
  orderNumber: string;
  note?: string;
}) {
  return buildUpiPaymentUrl(opts);
}
