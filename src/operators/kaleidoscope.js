export const name = 'kaleidoscope';

export function randomParams(rng) {
  const foldChoices = [4, 6, 6, 8, 8, 12];
  return {
    folds: foldChoices[Math.floor(rng() * foldChoices.length)],
    rotation: rng() * Math.PI * 2,
    speed: (rng() * 2 - 1) * 1.5,
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const cx = width / 2;
  const cy = height / 2;
  const folds = params.folds;
  const baseRotation = params.rotation + t * params.speed * Math.PI * 2;
  const wedge = (Math.PI * 2) / folds;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      let theta = Math.atan2(dy, dx) - baseRotation;
      theta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let reduced = theta % wedge;
      if (reduced > wedge / 2) reduced = wedge - reduced;
      const sx = Math.round(cx + r * Math.cos(reduced));
      const sy = Math.round(cy + r * Math.sin(reduced));
      const di = (y * width + x) * 4;
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const si = (sy * width + sx) * 4;
        data[di]     = src[si];
        data[di + 1] = src[si + 1];
        data[di + 2] = src[si + 2];
      }
    }
  }
  return imageData;
}
