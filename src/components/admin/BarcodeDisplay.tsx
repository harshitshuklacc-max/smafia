"use client";

import { useEffect, useRef } from "react";

export function BarcodeDisplay({
  barcode,
  compact,
}: {
  barcode: string;
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !barcode) return;
    import("bwip-js").then((mod) => {
      const bwipjs = mod.default || mod;
      try {
        bwipjs.toCanvas(canvasRef.current!, {
          bcid: "code128",
          text: barcode,
          scale: compact ? 2 : 3,
          height: compact ? 8 : 12,
          includetext: true,
          textxalign: "center",
        });
      } catch {
        // ignore render errors
      }
    });
  }, [barcode, compact]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `shoe-mafia-${barcode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printLabel() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Barcode ${barcode}</title></head>
      <body style="text-align:center;font-family:sans-serif">
        <h3>SHOE MAFIA</h3>
        <img src="${canvas.toDataURL()}" />
        <p>${barcode}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <div className={compact ? "flex items-center gap-3" : "mt-4"}>
      <canvas ref={canvasRef} className="rounded bg-white p-2" />
      {!compact && (
        <div className="mt-4 flex gap-3">
          <button onClick={download} className="btn-ghost text-sm">
            Download PNG
          </button>
          <button onClick={printLabel} className="btn-primary text-sm">
            Print Label
          </button>
        </div>
      )}
    </div>
  );
}
