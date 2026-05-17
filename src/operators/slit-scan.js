export const name = 'slit-scan';

export function randomParams(rng) {
  return {
    amplitude: 10 + rng() * 80,
    frequency: 0.005 + rng() * 0.06,
    phase: rng() * Math.PI * 2,
    speed: 0.5 + rng() * 2.5,
    axis: rng() < 0.5 ? 'h' : 'v',
  };
}

export function apply(imageData, params, t) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const amp = params.amplitude * (0.4 + t * 0.6);
  const timeShift = params.phase + t * params.speed * Math.PI * 2;

  if (params.axis === 'h') {
    for (let y = 0; y < height; y++) {
      const offset = Math.round(Math.sin(y * params.frequency + timeShift) * amp);
      for (let x = 0; x < width; x++) {
        const sx = ((x + offset) % width + width) % width;
        const di = (y * width + x) * 4;
        const si = (y * width + sx) * 4;
        data[di]     = src[si];
        data[di + 1] = src[si + 1];
        data[di + 2] = src[si + 2];
        data[di + 3] = src[si + 3];
      }
    }
  } else {
    for (let x = 0; x < width; x++) {
      const offset = Math.round(Math.sin(x * params.frequency + timeShift) * amp);
      for (let y = 0; y < height; y++) {
        const sy = ((y + offset) % height + height) % height;
        const di = (y * width + x) * 4;
        const si = (sy * width + x) * 4;
        data[di]     = src[si];
        data[di + 1] = src[si + 1];
        data[di + 2] = src[si + 2];
        data[di + 3] = src[si + 3];
      }
    }
  }
  return imageData;
}
