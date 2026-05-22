import fs from "fs";

export type BusyProduct = {
  bcn: string;
  artNo: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  opQty: number;
  qtyIn: number;
  qtyOut: number;
  inStock: boolean;
};

const PAIR_TAIL =
  /PAIR\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/i;

const SIZE_PATTERN = /^(\d{1,2}|NA)$/i;

export function parseBusyStockText(text: string): BusyProduct[] {
  const lines = text.split(/\r?\n/);
  const products: BusyProduct[] = [];
  let pending = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (
      line.startsWith("SHOE MAFIA") ||
      line.includes("BCN wise Stock") ||
      line.includes("Item Details") ||
      line.startsWith("From ") ||
      line.startsWith("All Items") ||
      line.startsWith("NEAR RAJA") ||
      /^--\s*\d+\s+of\s+\d+\s*--$/i.test(line)
    ) {
      continue;
    }

    const combined = pending ? `${pending} ${line}` : line;

    if (!PAIR_TAIL.test(combined)) {
      pending = combined;
      continue;
    }

    const parsed = parseProductLine(combined);
    pending = "";
    if (parsed) products.push(parsed);
  }

  return products;
}

function parseProductLine(line: string): BusyProduct | null {
  const tail = line.match(PAIR_TAIL);
  if (!tail) return null;

  const opQty = parseFloat(tail[1]);
  const qtyIn = parseFloat(tail[2]);
  const qtyOut = parseFloat(tail[3]);
  const closingQty = Math.round(parseFloat(tail[4]));

  const beforePair = line.slice(0, line.indexOf("PAIR")).trim();
  const priceMatch = beforePair.match(/([\d,]+\.\d{2})\s*$/);
  if (!priceMatch) return null;

  const price = parseFloat(priceMatch[1].replace(/,/g, ""));
  const beforePrice = beforePair.slice(0, beforePair.lastIndexOf(priceMatch[0])).trim();
  const tokens = beforePrice.split(/\s+/);
  if (tokens.length < 4) return null;

  const bcn = tokens[0];
  const rest = tokens.slice(1);

  let sizeIdx = -1;
  for (let i = rest.length - 1; i >= 0; i--) {
    if (SIZE_PATTERN.test(rest[i])) {
      sizeIdx = i;
      break;
    }
  }
  if (sizeIdx < 1) return null;

  const size = rest[sizeIdx];
  const color = rest.slice(sizeIdx + 1).join(" ") || "Standard";
  const artNo = rest.slice(0, sizeIdx).join(" ");

  return {
    bcn,
    artNo,
    size,
    color,
    price,
    quantity: closingQty,
    opQty,
    qtyIn,
    qtyOut,
    inStock: closingQty > 0,
  };
}

if (require.main === module || process.argv[1]?.includes("parse-busy")) {
  const text = fs.readFileSync(
    process.argv[2] || "prisma/busy-stock-extract.txt",
    "utf-8"
  );
  const products = parseBusyStockText(text);
  console.log("Parsed products:", products.length);
  console.log("In stock:", products.filter((p) => p.inStock).length);
  console.log("Out of stock:", products.filter((p) => !p.inStock).length);
  fs.writeFileSync(
    "prisma/busy-stock-parsed.json",
    JSON.stringify(products.slice(0, 5), null, 2)
  );
}
