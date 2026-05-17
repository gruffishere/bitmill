export const name = 'barrel';

export function randomParams(rng) {
  return {
    k: (rng() * 2 - 1) * 0.6,
    edgeFade: rng() < 0.5,
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const cx = width / 2;
  const cy = height / 2;
  const k = params.k * (0.3 + t * 0.9);
  const maxR2 = cx * cx + cy * cy;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r2 = (dx * dx + dy * dy) / maxR2;
      const factor = 1 + k * r2;
      const sx = Math.round(cx + dx * factor);
      const sy = Math.round(cy + dy * factor);
      const di = (y * width + x) * 4;
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const si = (sy * width + sx) * 4;
        data[di]     = src[si];
        data[di + 1] = src[si + 1];
        data[di + 2] = src[si + 2];
      } else {
        data[di] = 0; data[di + 1] = 0; data[di + 2] = 0;
      }
      if (params.edgeFade) {
        const fade = Math.max(0, 1 - r2 * 1.3);
        data[di]     *= fade;
        data[di + 1] *= fade;
        data[di + 2] *= fade;
      }
    }
  }
  return imageData;
}
