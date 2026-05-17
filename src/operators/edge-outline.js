export const name = 'edge-outline';

export function randomParams(rng) {
  return {
    blend: 0.4 + rng() * 0.45,
    threshold: 30 + rng() * 60,
    invert: rng() < 0.5,
    dimBackground: 0.2 + rng() * 0.4,
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const lum = new Float32Array(width * height);
  for (let i = 0, j = 0; j < width * height; i += 4, j++) {
    lum[j] = (src[i] + src[i + 1] + src[i + 2]) / 3;
  }
  const blend = params.blend * (0.4 + t * 0.7);
  const threshold = params.threshold;
  const dim = params.dimBackground * (0.4 + t * 0.6);
  const edgeVal = params.invert ? 0 : 255;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i00 = (y - 1) * width + (x - 1);
      const i01 = (y - 1) * width + x;
      const i02 = (y - 1) * width + (x + 1);
      const i10 = y * width + (x - 1);
      const i12 = y * width + (x + 1);
      const i20 = (y + 1) * width + (x - 1);
      const i21 = (y + 1) * width + x;
      const i22 = (y + 1) * width + (x + 1);

      const gx = -lum[i00] - 2 * lum[i10] - lum[i20] + lum[i02] + 2 * lum[i12] + lum[i22];
      const gy = -lum[i00] - 2 * lum[i01] - lum[i02] + lum[i20] + 2 * lum[i21] + lum[i22];
      const mag = Math.sqrt(gx * gx + gy * gy);

      const i = (y * width + x) * 4;
      if (mag > threshold) {
        data[i]     = data[i]     * (1 - blend) + edgeVal * blend;
        data[i + 1] = data[i + 1] * (1 - blend) + edgeVal * blend;
        data[i + 2] = data[i + 2] * (1 - blend) + edgeVal * blend;
      } else {
        data[i]     = data[i]     * (1 - dim);
        data[i + 1] = data[i + 1] * (1 - dim);
        data[i + 2] = data[i + 2] * (1 - dim);
      }
    }
  }
  return imageData;
}
