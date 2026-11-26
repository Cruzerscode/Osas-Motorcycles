export interface PaintMaskData {
  maskUrl: string;
  silhouetteUrl: string;
  hasAlpha: boolean;
  isAchromaticBase: boolean;
  sourceHue: number; // 0..360
  sourceLum: number; // 0..1
}

const maskCache = new Map<string, Promise<PaintMaskData | null>>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return [0, 0, l];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return [h * 60, s, l];
}

export function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return rgbToHsl(r, g, b);
}

export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for paint mask'));
    img.src = src;
  });
}

async function computePaintMask(src: string): Promise<PaintMaskData | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  try {
    const img = await loadImage(src);
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    if (!natW || !natH) return null;

    const maxDim = 680;
    const scale = Math.min(1, maxDim / Math.max(natW, natH));
    const w = Math.max(1, Math.round(natW * scale));
    const h = Math.max(1, Math.round(natH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const totalPixels = w * h;

    // Sample corner studio background color
    const corners = [0, (w - 1) * 4, (h - 1) * w * 4, (totalPixels - 1) * 4];
    let bgR = 0;
    let bgG = 0;
    let bgB = 0;
    let transparentCount = 0;

    for (const idx of corners) {
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    }
    bgR /= 4;
    bgG /= 4;
    bgB /= 4;

    // Pass 1: Detect transparency, silhouette, and dominant bodywork hue
    const hueBins = new Float32Array(36);
    let chromaticPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 235) {
        transparentCount++;
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      const sat = max > 0 ? chroma / max : 0;

      if (chroma >= 26 && sat >= 0.22) {
        const [hue, , lum] = rgbToHsl(r, g, b);
        if (lum > 0.08 && lum < 0.92) {
          const bin = Math.floor(((hue % 360) + 360) % 360 / 10) % 36;
          hueBins[bin] += chroma * sat;
          chromaticPixels++;
        }
      }
    }

    const hasAlpha = transparentCount > totalPixels * 0.03;
    const isAchromaticBase = chromaticPixels < totalPixels * 0.008;

    let bestBin = 0;
    let bestWeight = -1;
    for (let b = 0; b < 36; b++) {
      // Smooth across neighboring bins so split hues (like 355°/5°) add cleanly
      const prev = hueBins[(b + 35) % 36];
      const next = hueBins[(b + 1) % 36];
      const weight = hueBins[b] + prev * 0.55 + next * 0.55;
      if (weight > bestWeight) {
        bestWeight = weight;
        bestBin = b;
      }
    }
    const dominantHue = bestBin * 10 + 5;

    // Pass 2: Build paintMask & silhouetteMask PNGs
    const paintMaskData = ctx.createImageData(w, h);
    const silhouetteData = ctx.createImageData(w, h);
    const pOut = paintMaskData.data;
    const sOut = silhouetteData.data;

    let lumSum = 0;
    let lumCount = 0;

    for (let p = 0; p < totalPixels; p++) {
      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      const sat = max > 0 ? chroma / max : 0;
      const [hue, , lum] = rgbToHsl(r, g, b);

      // Silhouette alpha: exclude transparent pixels or studio gray/white background
      let silAlpha = a;
      if (!hasAlpha) {
        const bgDist = Math.hypot(r - bgR, g - bgG, b - bgB);
        if (bgDist < 24 && sat < 0.14 && lum > 0.72) {
          silAlpha = 0;
        } else if (bgDist < 42 && sat < 0.14 && lum > 0.78) {
          silAlpha = Math.round(((bgDist - 24) / 18) * 255);
        }
      }

      sOut[i] = 255;
      sOut[i + 1] = 255;
      sOut[i + 2] = 255;
      sOut[i + 3] = silAlpha;

      let paintAlpha = 0;
      if (silAlpha > 20) {
        if (!isAchromaticBase) {
          // Chromatic bodywork extraction (leaves tires, chrome, seat, shadow, background untouched)
          if (chroma >= 20 && sat >= 0.17 && lum > 0.06 && lum < 0.94) {
            const hDist = hueDistance(hue, dominantHue);
            // Allow main paint hue (+/- 42deg) with soft roll-off up to 62deg
            if (hDist <= 62) {
              const chromaFactor = Math.min(1, (chroma - 18) / 24);
              const satFactor = Math.min(1, (sat - 0.16) / 0.16);
              const hueFactor =
                hDist <= 42 ? 1 : Math.max(0, 1 - (hDist - 42) / 20);
              paintAlpha = Math.round(
                Math.min(1, chromaFactor * satFactor * hueFactor) *
                  (silAlpha / 255) *
                  255
              );
              if (paintAlpha > 140) {
                lumSum += lum;
                lumCount++;
              }
            }
          }
        } else {
          // Achromatic bike (e.g., Gloss Black Classic CG): isolate glossy dark bodywork panels in upper-mid region
          const yNorm = Math.floor(p / w) / h;
          const xNorm = (p % w) / w;
          const isBodyZone =
            yNorm >= 0.25 && yNorm <= 0.62 && xNorm >= 0.1 && xNorm <= 0.9;
          const isGlossyDarkPanel = lum >= 0.03 && lum <= 0.28 && sat < 0.22;
          if (isBodyZone && isGlossyDarkPanel) {
            paintAlpha = Math.round(silAlpha * 0.85);
            lumSum += lum;
            lumCount++;
          }
        }
      }

      pOut[i] = 255;
      pOut[i + 1] = 255;
      pOut[i + 2] = 255;
      pOut[i + 3] = paintAlpha;
    }

    const sourceLum = lumCount > 0 ? lumSum / lumCount : 0.42;

    // Export both masks as compact PNG data URLs
    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return null;

    outCtx.putImageData(paintMaskData, 0, 0);
    const maskUrl = outCanvas.toDataURL('image/png');

    outCtx.clearRect(0, 0, w, h);
    outCtx.putImageData(silhouetteData, 0, 0);
    const silhouetteUrl = outCanvas.toDataURL('image/png');

    return {
      maskUrl,
      silhouetteUrl,
      hasAlpha,
      isAchromaticBase,
      sourceHue: dominantHue,
      sourceLum,
    };
  } catch {
    return null;
  }
}

export function getPaintMaskForImage(
  src: string
): Promise<PaintMaskData | null> {
  if (!src) return Promise.resolve(null);
  const existing = maskCache.get(src);
  if (existing) return existing;

  const promise = computePaintMask(src);
  maskCache.set(src, promise);
  return promise;
}
