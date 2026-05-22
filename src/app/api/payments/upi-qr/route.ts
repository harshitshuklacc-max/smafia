import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildUpiQrPayload, UPI_ID, UPI_PAYEE_NAME } from "@/lib/upi";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive(),
  orderNumber: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get("amount"));
  const orderNumber = searchParams.get("orderNumber") || "";

  const parsed = schema.safeParse({ amount, orderNumber });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount or order number" }, { status: 400 });
  }

  const upiUrl = buildUpiQrPayload({
    amount: parsed.data.amount,
    orderNumber: parsed.data.orderNumber,
  });

  const qrDataUrl = await QRCode.toDataURL(upiUrl, {
    width: 320,
    margin: 2,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  return NextResponse.json({
    upiId: UPI_ID,
    payeeName: UPI_PAYEE_NAME,
    amount: parsed.data.amount,
    orderNumber: parsed.data.orderNumber,
    upiUrl,
    qrDataUrl,
  });
}
