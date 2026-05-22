/** Map Busy colour text → display colours for generated sneaker preview SVGs */

const COLOR_MAP: Record<string, { primary: string; secondary: string; accent: string }> = {
  white: { primary: "#f5f5f5", secondary: "#e0e0e0", accent: "#ffffff" },
  wht: { primary: "#f5f5f5", secondary: "#e0e0e0", accent: "#ffffff" },
  cream: { primary: "#f5f0e1", secondary: "#e8dcc8", accent: "#fff8ee" },
  blk: { primary: "#1a1a1a", secondary: "#0a0a0a", accent: "#333333" },
  black: { primary: "#1a1a1a", secondary: "#0a0a0a", accent: "#333333" },
  blue: { primary: "#1e3a8a", secondary: "#3b82f6", accent: "#60a5fa" },
  blu: { primary: "#1e40af", secondary: "#2563eb", accent: "#93c5fd" },
  red: { primary: "#991b1b", secondary: "#dc2626", accent: "#f87171" },
  green: { primary: "#166534", secondary: "#22c55e", accent: "#86efac" },
  grey: { primary: "#4b5563", secondary: "#6b7280", accent: "#9ca3af" },
  gray: { primary: "#4b5563", secondary: "#6b7280", accent: "#9ca3af" },
  gry: { primary: "#4b5563", secondary: "#6b7280", accent: "#9ca3af" },
  orange: { primary: "#c2410c", secondary: "#f97316", accent: "#fdba74" },
  yellow: { primary: "#ca8a04", secondary: "#eab308", accent: "#fde047" },
  pink: { primary: "#be185d", secondary: "#ec4899", accent: "#f9a8d4" },
  brown: { primary: "#78350f", secondary: "#a16207", accent: "#d97706" },
  biege: { primary: "#d4c4a8", secondary: "#e8dcc8", accent: "#f5f0e1" },
  beige: { primary: "#d4c4a8", secondary: "#e8dcc8", accent: "#f5f0e1" },
  neon: { primary: "#39ff14", secondary: "#22c55e", accent: "#00f0ff" },
  pista: { primary: "#84cc16", secondary: "#a3e635", accent: "#ecfccb" },
  purple: { primary: "#6b21a8", secondary: "#9333ea", accent: "#c084fc" },
  multi: { primary: "#39ff14", secondary: "#00f0ff", accent: "#d4af37" },
  panda: { primary: "#f5f5f5", secondary: "#1a1a1a", accent: "#888888" },
  sky: { primary: "#7dd3fc", secondary: "#0ea5e9", accent: "#e0f2fe" },
  mint: { primary: "#6ee7b7", secondary: "#10b981", accent: "#d1fae5" },
};

const DEFAULT_PALETTE = { primary: "#2a2a2a", secondary: "#39ff14", accent: "#00f0ff" };

export function resolveColorPalette(colorText?: string | null) {
  if (!colorText) return DEFAULT_PALETTE;
  const lower = colorText.toLowerCase();
  for (const [key, palette] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return palette;
  }
  return DEFAULT_PALETTE;
}

export function inferBrandLabel(artNo?: string | null, name?: string): string {
  const text = `${artNo || ""} ${name || ""}`.toUpperCase();
  if (text.includes("NIKE") || text.includes("JORDAN") || text.includes("DUNK") || text.includes("AIR FORCE") || text.includes("PEGASUS")) return "NIKE";
  if (text.includes("PUMA")) return "PUMA";
  if (text.includes("ADIDAS") || text.includes("ADIZERO") || text.includes("SAMBA")) return "ADIDAS";
  if (text.includes("YEEZY") || text.includes("YEZZY")) return "YEEZY";
  if (text.includes("NEW BALANCE") || text.includes(" NB ")) return "NB";
  if (text.includes("REEBOK")) return "REEBOK";
  if (text.includes("SKECHER")) return "SKECHERS";
  if (text.includes("ASICS") || text.includes("TIGER")) return "ASICS";
  if (text.includes("CONVERCE") || text.includes("CONVERSE")) return "CONVERSE";
  if (text.includes("ON ") || text.includes("CLOUD")) return "ON";
  return "SHOE MAFIA";
}

export function buildProductImageSvg(opts: {
  artNo?: string | null;
  color?: string | null;
  name?: string;
  size?: string;
}) {
  const palette = resolveColorPalette(opts.color);
  const brand = inferBrandLabel(opts.artNo, opts.name);
  const title = (opts.artNo || opts.name || "SNEAKER").slice(0, 28).toUpperCase();
  const colorLabel = (opts.color || "CLASSIC").toUpperCase();
  const sizeLabel = opts.size ? `UK ${opts.size}` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#141414"/>
    </linearGradient>
    <linearGradient id="shoe" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${palette.primary}"/>
      <stop offset="50%" style="stop-color:${palette.secondary}"/>
      <stop offset="100%" style="stop-color:${palette.accent}"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <ellipse cx="200" cy="340" rx="130" ry="18" fill="${palette.secondary}" opacity="0.25"/>
  <path d="M70 230 Q110 190 200 175 Q290 160 330 210 L345 265 Q300 300 200 310 Q100 320 70 270 Z" fill="url(#shoe)" stroke="${palette.accent}" stroke-width="2" filter="url(#glow)"/>
  <path d="M95 250 L175 235 L215 255 L155 275 Z" fill="#0a0a0a" opacity="0.35"/>
  <circle cx="130" cy="268" r="32" fill="#0a0a0a" stroke="${palette.accent}" stroke-width="2"/>
  <circle cx="270" cy="268" r="32" fill="#0a0a0a" stroke="${palette.accent}" stroke-width="2"/>
  <text x="200" y="55" text-anchor="middle" fill="${palette.accent}" font-family="Arial Black,sans-serif" font-size="14" font-weight="900">${brand}</text>
  <text x="200" y="85" text-anchor="middle" fill="#f5f5f5" font-family="Arial,sans-serif" font-size="11" font-weight="700">${title}</text>
  <text x="200" y="108" text-anchor="middle" fill="${palette.secondary}" font-family="Arial,sans-serif" font-size="10">${colorLabel}</text>
  ${sizeLabel ? `<text x="200" y="128" text-anchor="middle" fill="#888" font-family="Arial,sans-serif" font-size="9">${sizeLabel}</text>` : ""}
  <text x="200" y="385" text-anchor="middle" fill="#555" font-family="Arial,sans-serif" font-size="9">SHOE MAFIA</text>
</svg>`;
}

export function productImageUrl(productId: string) {
  return `/api/product-image/${productId}`;
}
