const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

let keyIndex = 0;
let cachedWorkingModel = null;

// Official Google Gemini model identifiers ordered by priority
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-1.0-pro',
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
    throw new Error('No Gemini API key configured. Set GEMINI_API_KEY or GEMINI_API_KEYS in your environment.');
  }

  let lastError = null;

  const modelsToTry = cachedWorkingModel
    ? [cachedWorkingModel, ...CANDIDATE_MODELS.filter((m) => m !== cachedWorkingModel)]
    : [...CANDIDATE_MODELS];

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of modelsToTry) {
      try {
        const result = await runFn(genAI, modelName);
        cachedWorkingModel = modelName;
        return result;
      } catch (err) {
        lastError = err;

        if (isNotFoundError(err)) {
          console.warn(`⚠️ Model "${modelName}" returned 404. Trying next candidate model...`);
          if (cachedWorkingModel === modelName) cachedWorkingModel = null;
          continue;
        }

        if (isQuotaError(err)) {
          console.warn(`⚠️ Gemini API key ${attempt + 1}/${GEMINI_KEYS.length} hit quota limit. Rotating API key...`);
          break;
        }

        throw err;
      }
    }
  }

  if (lastError && isNotFoundError(lastError)) {
    throw new Error(
      'Gemini API returned 404 for all model endpoints. Please verify that "Generative Language API" is enabled in your Google Cloud Console for this API key.'
    );
  }

  throw lastError || new Error('All Gemini API keys and candidate models exhausted.');
}

module.exports = { GEMINI_KEYS, withKeyRotation };