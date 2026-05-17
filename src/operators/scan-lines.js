export const name = 'scan-lines';

export function randomParams(rng) {
  return {
    intensity: 0.3 + rng() * 0.5,
    spacing: 2 + Math.floor(rng() * 4),
    rgbStripe: rng() < 0.4,
    rolling: rng() < 0.7,
    rollSpeed: 50 + rng() * 250,
    aberration: Math.floor(rng() * 3),
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const intensity = params.intensity * (0.4 + t * 0.7);
  const rollOffset = params.rolling ? Math.floor(t * params.rollSpeed) : 0;

  for (let y = 0; y < height; y++) {
    const lineY = ((y + rollOffset) % params.spacing + params.spacing) % params.spacing;
    const isDark = lineY === 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isDark) {
        data[i]     = data[i]     * (1 - intensity);
        data[i + 1] = data[i + 1] * (1 - intensity);
        data[i + 2] = data[i + 2] * (1 - intensity);
      }
      if (params.rgbStripe) {
        const s = x % 3;
        if (s === 0) { data[i + 1] *= 0.85; data[i + 2] *= 0.85; }
        else if (s === 1) { data[i] *= 0.85; data[i + 2] *= 0.85; }
        else { data[i] *= 0.85; data[i + 1] *= 0.85; }
      }
    }
  }

  if (params.aberration > 0) {
    const src = new Uint8ClampedArray(data);
    const off = params.aberration;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const lx = Math.max(0, x - off);
        const rx = Math.min(width - 1, x + off);
        data[i]     = src[(y * width + lx) * 4];
        data[i + 2] = src[(y * width + rx) * 4 + 2];
      }
    }
  }

  return imageData;
}
