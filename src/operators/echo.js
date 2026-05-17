export const name = 'echo';

export function randomParams(rng) {
  return {
    angle: rng() * Math.PI * 2,
    length: 20 + rng() * 60,
    steps: 5 + Math.floor(rng() * 6),
    decay: 0.55 + rng() * 0.3,
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const len = params.length * (0.3 + t * 0.9);
  const dx = Math.cos(params.angle) * len;
  const dy = Math.sin(params.angle) * len;
  const steps = params.steps;
  const decay = params.decay;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, w = 0;
      for (let s = 0; s < steps; s++) {
        const weight = Math.pow(decay, s);
        const sx = Math.round(x - dx * s / steps);
        const sy = Math.round(y - dy * s / steps);
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
        const i = (sy * width + sx) * 4;
        r += src[i] * weight;
        g += src[i + 1] * weight;
        b += src[i + 2] * weight;
        w += weight;
      }
      const di = (y * width + x) * 4;
      if (w > 0) {
        data[di]     = r / w;
        data[di + 1] = g / w;
        data[di + 2] = b / w;
      }
    }
  }
  return imageData;
}
