import { generate } from './engine.js';
import { randomSeed } from './rng.js';
import { startPlayback, stopPlayback } from './playback.js';

const ALL_OPS = [
  'pixel-sort', 'channel-shift', 'bit-crush', 'slit-scan',
  'jpeg-bomb', 'block-shuffle', 'scan-lines', 'displacement',
  'echo', 'kaleidoscope', 'noise', 'pixelate',
  'hue-rotate', 'vhs-tracking', 'sub-region', 'halftone',
  'barrel', 'edge-outline',
];
const enabledOps = new Set(ALL_OPS);

const uploadInput = document.getElementById('upload');
const uploadBtn = document.getElementById('uploadBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const previewCanvas = document.getElementById('preview');
const emptyState = document.getElementById('emptyState');
const statusLine = document.getElementById('statusLine');
const progressFill = document.getElementById('progressFill');
const recipeText = document.getElementById('recipeText');
const display = document.getElementById('display');
const opButtons = document.querySelectorAll('.op-btn');
const opCountEl = document.getElementById('opCount');
const intensitiesPanel = document.getElementById('intensitiesPanel');
const intensitiesList = document.getElementById('intensitiesList');
const seedInput = document.getElementById('seedInput');

let sourceImage = null;
let lastGifBlob = null;
let lastSeed = null;
const TOTAL_OPS = ALL_OPS.length;

opButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const op = btn.dataset.op;
    if (enabledOps.has(op)) {
      if (enabledOps.size > 1) {
        enabledOps.delete(op);
        btn.classList.remove('active');
      } else {
        flashButton(btn);
      }
    } else {
      enabledOps.add(op);
      btn.classList.add('active');
    }
    updateOpCount();
  });
});

function flashButton(btn) {
  btn.style.borderColor = '#aa3333';
  setTimeout(() => { btn.style.borderColor = ''; }, 300);
}

function updateOpCount() {
  opCountEl.textContent = `${enabledOps.size}/${TOTAL_OPS}`;
}

function setOpsProcessing(processing) {
  opButtons.forEach((btn) => {
    if (processing && btn.classList.contains('active')) {
      btn.classList.add('processing');
    } else {
      btn.classList.remove('processing');
    }
    btn.disabled = processing;
  });
}

updateOpCount();

uploadBtn.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) await loadImage(file);
});

display.addEventListener('dragover', (e) => {
  e.preventDefault();
  display.style.borderColor = '#666';
});
display.addEventListener('dragleave', () => {
  display.style.borderColor = '';
});
display.addEventListener('drop', async (e) => {
  e.preventDefault();
  display.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) await loadImage(file);
});

async function loadImage(file) {
  stopPlayback();
  const url = URL.createObjectURL(file);
  const img = new Image();
  try {
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
  } catch (e) {
    statusLine.textContent = 'IMAGE LOAD FAILED';
    return;
  }
  sourceImage = img;

  emptyState.hidden = true;
  drawSourceToPreview();
  generateBtn.disabled = false;
  downloadBtn.disabled = true;
  statusLine.textContent = `IMAGE LOADED  ${img.naturalWidth}x${img.naturalHeight}`;
  progressFill.style.width = '0%';
  recipeText.textContent = 'none';
}

function drawSourceToPreview() {
  const ctx = previewCanvas.getContext('2d');
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  const iw = sourceImage.naturalWidth;
  const ih = sourceImage.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(sourceImage, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

generateBtn.addEventListener('click', async () => {
  if (!sourceImage) return;
  stopPlayback();
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  uploadBtn.disabled = true;
  setOpsProcessing(true);

  const inputVal = seedInput.value.trim();
  const parsed = inputVal === '' ? NaN : Number(inputVal);
  const seed = Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : randomSeed();
  const t0 = performance.now();

  try {
    const result = await generate(sourceImage, {
      width: 512,
      height: 512,
      frameCount: 30,
      fps: 15,
      seed,
      enabledOperators: [...enabledOps],
      onFrame: (canvas, i, total) => {
        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        progressFill.style.width = `${((i + 1) / total) * 85}%`;
      },
      onStatus: (msg) => { statusLine.textContent = msg; },
      onEncodeProgress: (p) => {
        progressFill.style.width = `${85 + p * 15}%`;
      },
      onFramesReady: (frames, fps, ops) => {
        startPlayback(previewCanvas, frames, fps);
        statusLine.textContent = 'LOOPING / ENCODING GIF...';
        renderIntensities(ops);
      },
    });

    lastGifBlob = result.blob;
    lastSeed = result.seed;

    const ms = Math.round(performance.now() - t0);
    renderRecipe(result, ms);
    renderIntensities(result.ops);
    statusLine.textContent = 'DONE  LOOPING';
    progressFill.style.width = '100%';
    downloadBtn.disabled = false;
  } catch (e) {
    console.error(e);
    statusLine.textContent = 'ERROR: ' + (e.message || e);
  } finally {
    generateBtn.disabled = false;
    uploadBtn.disabled = false;
    setOpsProcessing(false);
  }
});

function renderRecipe(result, ms) {
  const opsStr = result.ops
    .map((o) => `${o.name}@${Math.round(o.intensity * 100)}%`)
    .join(' &gt; ');
  recipeText.innerHTML =
    `<span class="seed-copy" title="click to copy">seed: ${result.seed}</span><br>` +
    `order (${result.ops.length}): ${opsStr}<br>` +
    `time: ${ms}ms  size: ${(result.blob.size / 1024).toFixed(1)}kb`;
}

function renderIntensities(ops) {
  if (!ops || ops.length === 0) {
    intensitiesPanel.hidden = true;
    return;
  }
  const sorted = [...ops].sort((a, b) => b.intensity - a.intensity);
  intensitiesList.innerHTML = '';
  for (const op of sorted) {
    const pct = Math.round(op.intensity * 100);
    const row = document.createElement('div');
    row.className = 'intensity-row';
    row.innerHTML =
      `<div class="intensity-fill" style="width: ${pct}%"></div>` +
      `<span class="intensity-name">${op.name}</span>` +
      `<span class="intensity-pct">${pct}%</span>`;
    intensitiesList.appendChild(row);
  }
  intensitiesPanel.hidden = false;
}

recipeText.addEventListener('click', async (e) => {
  const target = e.target;
  if (target && target.classList && target.classList.contains('seed-copy')) {
    seedInput.value = String(lastSeed);
    try {
      await navigator.clipboard.writeText(String(lastSeed));
      const original = target.textContent;
      target.textContent = `seed: ${lastSeed} (copied + loaded)`;
      setTimeout(() => { target.textContent = original; }, 1800);
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  }
});

downloadBtn.addEventListener('click', () => {
  if (!lastGifBlob) return;
  const url = URL.createObjectURL(lastGifBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ilovepurechaos_${lastSeed}.gif`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'g' || e.key === 'G') {
    if (!generateBtn.disabled) generateBtn.click();
  }
});
