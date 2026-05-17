export const name = 'hue-rotate';

export function randomParams(rng) {
  return {
    startDeg: rng() * 360,
    sweepDeg: (rng() * 2 - 1) * 540,
  };
}

export function apply(imageData, params, t) {
  const { data } = imageData;
  const deg = params.startDeg + params.sweepDeg * t;
  const rad = (deg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const m00 = 0.213 + cosA * 0.787 - sinA * 0.213;
  const m01 = 0.715 - cosA * 0.715 - sinA * 0.715;
  const m02 = 0.072 - cosA * 0.072 + sinA * 0.928;
  const m10 = 0.213 - cosA * 0.213 + sinA * 0.143;
  const m11 = 0.715 + cosA * 0.285 + sinA * 0.140;
  const m12 = 0.072 - cosA * 0.072 - sinA * 0.283;
  const m20 = 0.213 - cosA * 0.213 - sinA * 0.787;
  const m21 = 0.715 - cosA * 0.715 + sinA * 0.715;
  const m22 = 0.072 + cosA * 0.928 + sinA * 0.072;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i]     = clamp(r * m00 + g * m01 + b * m02);
    data[i + 1] = clamp(r * m10 + g * m11 + b * m12);
    data[i + 2] = clamp(r * m20 + g * m21 + b * m22);
  }
  return imageData;
}

function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
