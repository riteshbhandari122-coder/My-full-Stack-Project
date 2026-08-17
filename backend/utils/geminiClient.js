const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

let keyIndex = 0;

// Candidate models ordered by priority
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
];

const isQuotaError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('quota') || msg.includes('rate limit') || msg.includes('429') || msg.includes('resource_exhausted');
};

const isNotFoundError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('404') || msg.includes('not found') || msg.includes('no longer available');
};

async function withKeyRotation(runFn) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('No Gemini API key configured. Set GEMINI_API_KEY or GEMINI_API_KEYS.');
  }

  let lastError = null;

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of CANDIDATE_MODELS) {
      try {
        return await runFn(genAI, modelName);
      } catch (err) {
        lastError = err;

        if (isNotFoundError(err)) {
          console.warn(`⚠️ Model "${modelName}" returned 404/deprecated. Trying next candidate model...`);
          continue;
        }

        if (isQuotaError(err)) {
          console.warn(`⚠️ Gemini key ${attempt + 1}/${GEMINI_KEYS.length} hit quota/rate limit, switching key...`);
          break;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini API keys and models exhausted');
}

module.exports = { GEMINI_KEYS, withKeyRotation };