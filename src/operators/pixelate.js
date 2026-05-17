export const name = 'pixelate';

export function randomParams(rng) {
  return {
    minBlock: 2 + Math.floor(rng() * 4),
    maxBlock: 12 + Math.floor(rng() * 32),
    direction: rng() < 0.5 ? 'shrink' : 'grow',
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const span = params.maxBlock - params.minBlock;
  const block = Math.max(2, Math.round(
    params.direction === 'grow'
      ? params.minBlock + span * t
      : params.maxBlock - span * t
  ));

  for (let by = 0; by < height; by += block) {
    for (let bx = 0; bx < width; bx += block) {
      let r = 0, g = 0, b = 0, c = 0;
      const ymax = Math.min(by + block, height);
      const xmax = Math.min(bx + block, width);
      for (let y = by; y < ymax; y++) {
        for (let x = bx; x < xmax; x++) {
          const i = (y * width + x) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; c++;
        }
      }
      r /= c; g /= c; b /= c;
      for (let y = by; y < ymax; y++) {
        for (let x = bx; x < xmax; x++) {
          const i = (y * width + x) * 4;
          data[i]     = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }
  return imageData;
}
