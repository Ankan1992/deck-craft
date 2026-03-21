// Color extraction engine
// Extracts color schemes from:
//   1. Uploaded images (dominant color palette via canvas pixel sampling)
//   2. Uploaded .pptx files (theme XML parsing)
//   3. Manual hex input

import { TemplateColors } from "./templates";

export interface ExtractedPalette {
  source: "image" | "pptx" | "manual";
  fileName?: string;
  colors: string[]; // array of hex colors extracted
  suggested: TemplateColors; // mapped to our template color model
}

// ============================================================
// 1.  Extract colors from an image via <canvas> pixel sampling
// ============================================================
export async function extractColorsFromImage(file: File): Promise<ExtractedPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Downsample for performance
        const MAX = 150;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = quantizeColors(imageData, 8);
        const suggested = mapToTemplateColors(colors);

        resolve({
          source: "image",
          fileName: file.name,
          colors: colors.map(rgbToHex),
          suggested,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Simple median-cut color quantisation
function quantizeColors(data: Uint8ClampedArray, count: number): [number, number, number][] {
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    // Skip near-transparent pixels
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (pixels.length === 0) return [[0, 0, 0]];

  // K-means-lite: bucket by dominant channel, average each bucket
  const buckets = medianCut(pixels, count);
  // Sort dark → light
  return buckets
    .map(bucket => averageColor(bucket))
    .sort((a, b) => luminance(a) - luminance(b));
}

function medianCut(
  pixels: [number, number, number][],
  depth: number
): [number, number, number][][] {
  if (depth === 0 || pixels.length < 2) return [pixels];

  // Find channel with widest range
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r; if (r > rMax) rMax = r;
    if (g < gMin) gMin = g; if (g > gMax) gMax = g;
    if (b < bMin) bMin = b; if (b > bMax) bMax = b;
  }
  const ranges = [rMax - rMin, gMax - gMin, bMax - bMin];
  const channel = ranges.indexOf(Math.max(...ranges));

  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);

  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function averageColor(pixels: [number, number, number][]): [number, number, number] {
  if (pixels.length === 0) return [0, 0, 0];
  let r = 0, g = 0, b = 0;
  for (const [pr, pg, pb] of pixels) { r += pr; g += pg; b += pb; }
  const n = pixels.length;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function luminance([r, g, b]: [number, number, number]): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

// ============================================================
// 2.  Extract theme colors from a .pptx file (Office Open XML)
// ============================================================
export async function extractColorsFromPptx(file: File): Promise<ExtractedPalette> {
  const JSZip = (await import("jszip")).default;
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const colors: string[] = [];

  // Try theme1.xml first (primary PowerPoint theme)
  const themeFiles = Object.keys(zip.files).filter(
    f => f.match(/ppt\/theme\/theme\d+\.xml/)
  );

  for (const themePath of themeFiles) {
    const xml = await zip.files[themePath].async("text");
    // Extract <a:srgbClr val="RRGGBB"/> and <a:sysClr lastClr="RRGGBB"/>
    const srgbRe = /srgbClr\s+val="([0-9A-Fa-f]{6})"/g;
    let m: RegExpExecArray | null;
    while ((m = srgbRe.exec(xml)) !== null) {
      colors.push("#" + m[1].toUpperCase());
    }

    const sysRe = /sysClr[^>]+lastClr="([0-9A-Fa-f]{6})"/g;
    while ((m = sysRe.exec(xml)) !== null) {
      colors.push("#" + m[1].toUpperCase());
    }
  }

  // Also try slideMaster XML for additional colors
  const masterFiles = Object.keys(zip.files).filter(
    f => f.match(/ppt\/slideMasters\/slideMaster\d+\.xml/)
  );
  for (const masterPath of masterFiles) {
    const xml = await zip.files[masterPath].async("text");
    const srgbRe2 = /srgbClr\s+val="([0-9A-Fa-f]{6})"/g;
    let m2: RegExpExecArray | null;
    while ((m2 = srgbRe2.exec(xml)) !== null) {
      colors.push("#" + m2[1].toUpperCase());
    }
  }

  // Deduplicate
  const unique = Array.from(new Set(colors)).slice(0, 12);

  if (unique.length === 0) {
    throw new Error("No theme colors found in this .pptx file. Try uploading a screenshot of a slide instead.");
  }

  const suggested = mapToTemplateColors(
    unique.map(hex => hexToRgbTuple(hex))
  );

  return {
    source: "pptx",
    fileName: file.name,
    colors: unique,
    suggested,
  };
}

// ============================================================
// 3.  Build from manual hex inputs
// ============================================================
export function buildPaletteFromHex(hexColors: string[]): ExtractedPalette {
  const valid = hexColors
    .map(h => h.trim())
    .filter(h => /^#?[0-9A-Fa-f]{6}$/.test(h))
    .map(h => (h.startsWith("#") ? h : "#" + h));

  if (valid.length === 0) throw new Error("No valid hex colors provided");

  const suggested = mapToTemplateColors(valid.map(hexToRgbTuple));

  return {
    source: "manual",
    colors: valid,
    suggested,
  };
}

// ============================================================
// Helper: map an array of extracted colors → TemplateColors
// ============================================================
function mapToTemplateColors(colors: [number, number, number][]): TemplateColors {
  // Sort by luminance
  const sorted = [...colors].sort((a, b) => luminance(a) - luminance(b));

  const darkest = sorted[0];
  const lightest = sorted[sorted.length - 1];
  const mid = sorted[Math.floor(sorted.length / 2)];

  // Find most saturated color for accent
  const mostSaturated = [...colors].sort((a, b) => saturation(b) - saturation(a))[0];
  // Second most saturated (avoid duplicate)
  const secondSaturated = [...colors]
    .filter(c => c !== mostSaturated)
    .sort((a, b) => saturation(b) - saturation(a))[0] || mid;

  const bgIsLight = luminance(lightest) > 200;

  return {
    primary: rgbToHex(darkest),
    secondary: rgbToHex(mid),
    accent: rgbToHex(mostSaturated),
    background: bgIsLight ? rgbToHex(lightest) : "#FFFFFF",
    text: bgIsLight ? rgbToHex(darkest) : "#222222",
    textLight: rgbToHex(sorted[Math.min(2, sorted.length - 1)]),
    highlight: rgbToHex(mostSaturated),
    gradient: [rgbToHex(darkest), rgbToHex(secondSaturated)],
  };
}

function saturation([r, g, b]: [number, number, number]): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
