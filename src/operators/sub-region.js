export const name = 'sub-region';

export function randomParams(rng) {
  return {
    x: rng() * 0.6,
    y: rng() * 0.6,
    w: 0.25 + rng() * 0.45,
    h: 0.25 + rng() * 0.45,
    shiftRange: 20 + rng() * 60,
    xorAmount: 0.2 + rng() * 0.5,
  };
}

export function apply(imageData, params, t, rng) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const x0 = Math.max(0, Math.floor(params.x * width));
  const y0 = Math.max(0, Math.floor(params.y * height));
  const x1 = Math.min(width, x0 + Math.floor(params.w * width));
  const y1 = Math.min(height, y0 + Math.floor(params.h * height));
  if (x1 <= x0 || y1 <= y0) return imageData;

  const shift = Math.floor(params.shiftRange * (0.3 + t * 0.9));
  const xorMask = Math.floor(params.xorAmount * 255 * t);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      const rSx = clamp(x + shift, 0, width - 1);
      const bSx = clamp(x - shift, 0, width - 1);
      data[i]     = src[(y * width + rSx) * 4]     ^ xorMask;
      data[i + 1] = src[(y * width + x) * 4 + 1];
      data[i + 2] = src[(y * width + bSx) * 4 + 2] ^ xorMask;
    }
  }
  return imageData;
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
