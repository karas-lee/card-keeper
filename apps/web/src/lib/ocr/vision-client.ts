import { createWorker, PSM, Worker } from "tesseract.js";
import sharp from "sharp";

export interface VisionResult {
  rawText: string;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Worker Pool (singleton, lazy init)
// ---------------------------------------------------------------------------
const POOL_SIZE = Math.max(1, parseInt(process.env.OCR_POOL_SIZE || "2", 10));
const LANGUAGES = "kor+eng+jpn";

let pool: Worker[] | null = null;
let roundRobin = 0;
let initPromise: Promise<Worker[]> | null = null;

async function createPool(): Promise<Worker[]> {
  const workers: Worker[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const worker = await createWorker(LANGUAGES);
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      user_defined_dpi: "300",
      preserve_interword_spaces: "1",
    });
    workers.push(worker);
  }
  return workers;
}

function getPool(): Promise<Worker[]> {
  if (pool) return Promise.resolve(pool);
  if (!initPromise) {
    initPromise = createPool().then((w) => {
      pool = w;
      return w;
    });
  }
  return initPromise;
}

function pickWorker(workers: Worker[]): Worker {
  const worker = workers[roundRobin % workers.length]!;
  roundRobin++;
  return worker;
}

// Graceful shutdown
function shutdown() {
  if (pool) {
    for (const w of pool) {
      w.terminate().catch(() => {});
    }
    pool = null;
    initPromise = null;
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ---------------------------------------------------------------------------
// Image preprocessing via sharp (dual-pass)
// ---------------------------------------------------------------------------

/** Strategy A — optimised for light-background business cards */
async function preprocessA(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(3000, 3000, { fit: "inside" })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.5 })
    .threshold(140)
    .png()
    .toBuffer();
}

/** Strategy B — optimised for dark-background / low-contrast business cards */
async function preprocessB(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(3000, 3000, { fit: "inside" })
    .grayscale()
    .negate()
    .normalize()
    .sharpen({ sigma: 1.5 })
    .threshold(140)
    .png()
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Confidence: character-count weighted average of word confidences → 0-1
// ---------------------------------------------------------------------------
function computeConfidence(data: { words?: { text: string; confidence: number }[] }): number {
  const words = data.words;
  if (!words || words.length === 0) return 0;

  let totalChars = 0;
  let weightedSum = 0;

  for (const w of words) {
    const len = w.text.length;
    totalChars += len;
    weightedSum += w.confidence * len;
  }

  if (totalChars === 0) return 0;
  return weightedSum / totalChars / 100; // Tesseract confidence is 0-100
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function performOcr(imageBuffer: Buffer): Promise<VisionResult> {
  try {
    const [imgA, imgB] = await Promise.all([
      preprocessA(imageBuffer),
      preprocessB(imageBuffer),
    ]);

    const workers = await getPool();
    const workerA = pickWorker(workers);
    const workerB = pickWorker(workers);

    const [resA, resB] = await Promise.all([
      workerA.recognize(imgA, { rotateAuto: true }),
      workerB.recognize(imgB, { rotateAuto: true }),
    ]);

    const confA = computeConfidence(resA.data);
    const confB = computeConfidence(resB.data);

    const best = confA >= confB ? resA.data : resB.data;
    const bestConf = confA >= confB ? confA : confB;

    return {
      rawText: best.text || "",
      confidence: bestConf,
    };
  } catch (error) {
    console.error("[OCR] Tesseract recognition failed:", error);
    return { rawText: "", confidence: 0 };
  }
}
