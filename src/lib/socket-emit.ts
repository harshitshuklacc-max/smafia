const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export async function emitInventoryUpdate(payload: {
  productId: string;
  quantity: number;
  barcode: string;
  isActive: boolean;
}) {
  try {
    await fetch(`${SOCKET_URL}/emit/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Socket server may be offline in dev
  }
}

export async function emitOrderUpdate(payload: {
  orderId: string;
  orderNumber: string;
  status: string;
}) {
  try {
    await fetch(`${SOCKET_URL}/emit/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }
}
