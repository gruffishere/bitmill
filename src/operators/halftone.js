export const name = 'halftone';

const BAYER_8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export function randomParams(rng) {
  return {
    levels: 2 + Math.floor(rng() * 4),
    scale: 1 + Math.floor(rng() * 3),
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const levels = Math.max(2, params.levels);
  const step = 256 / levels;
  const scale = params.scale;
  const strength = 0.5 + t * 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bx = (Math.floor(x / scale)) % 8;
      const by = (Math.floor(y / scale)) % 8;
      const threshold = (BAYER_8[by][bx] / 64 - 0.5) * step * strength;
      const i = (y * width + x) * 4;
      data[i]     = ditherChannel(data[i], threshold, step);
      data[i + 1] = ditherChannel(data[i + 1], threshold, step);
      data[i + 2] = ditherChannel(data[i + 2], threshold, step);
    }
  }
  return imageData;
}

function ditherChannel(v, threshold, step) {
  const r = Math.round((v + threshold) / step) * step;
  return r < 0 ? 0 : r > 255 ? 255 : r;
}
