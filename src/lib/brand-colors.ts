import { useEffect, useState } from "react";

/** Quantise a pixel into a coarse bucket so near-identical shades group together. */
function bucket(r: number, g: number, b: number) {
  return `${r >> 4}-${g >> 4}-${b >> 4}`;
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
}

function isBoring(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const sat = max === min ? 0 : (max - min) / (light > 127 ? 510 - max - min : max + min);
  // Skip near-white / near-black / washed-out greys — they never read as brand colors.
  return light > 238 || light < 18 || sat < 0.16;
}

/**
 * Pulls the dominant brand colors out of an image (uploaded logo or photo).
 * Runs entirely client-side on a canvas; returns hex values sorted by frequency.
 */
export async function extractBrandColors(src: string, limit = 6): Promise<string[]> {
  if (typeof window === "undefined" || !src) return [];
  const img = new Image();
  if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
  img.src = src;
  try {
    await img.decode();
  } catch {
    return [];
  }
  const w = 64;
  const h = Math.max(1, Math.round((img.naturalHeight / (img.naturalWidth || 1)) * w)) || 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return [];
  }

  const counts = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 200 || isBoring(r, g, b)) continue;
    const k = bucket(r, g, b);
    const prev = counts.get(k);
    if (prev) {
      prev.n += 1;
      prev.r += r;
      prev.g += g;
      prev.b += b;
    } else {
      counts.set(k, { n: 1, r, g, b });
    }
  }

  return [...counts.values()]
    .sort((a, z) => z.n - a.n)
    .slice(0, limit)
    .map((c) => toHex(Math.round(c.r / c.n), Math.round(c.g / c.n), Math.round(c.b / c.n)));
}

/** Brand colors detected from the signature's logo, falling back to the photo. */
export function useBrandColors(logoUrl?: string, photoUrl?: string) {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const src = logoUrl || photoUrl || "";

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setColors([]);
      return;
    }
    setLoading(true);
    extractBrandColors(src)
      .then((c) => {
        if (!cancelled) setColors(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return { colors, loading, hasSource: !!src };
}
