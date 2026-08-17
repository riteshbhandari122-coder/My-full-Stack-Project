const { GoogleGenerativeAI } = require('@google/generative-ai');

const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
const GEMINI_KEYS = rawKeys
  .split(',')
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

// Only use current active models that exist on the API
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

let keyIndex = 0;

async function withKeyRotation(apiCallback) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('No Gemini API key configured on server.');
  }

  let lastError = null;

  for (let k = 0; k < GEMINI_KEYS.length; k++) {
    const currentKey = GEMINI_KEYS[(keyIndex + k) % GEMINI_KEYS.length];
    const genAI = new GoogleGenerativeAI(currentKey);

    for (const modelName of MODELS_TO_TRY) {
      try {
        const result = await apiCallback(genAI, modelName);
        keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
        return result;
      } catch (err) {
        lastError = err;
        const errStr = String(err?.message || err);

        if (errStr.includes('404') || err?.status === 404) {
          console.warn(`⚠️ Model "${modelName}" returned 404, trying next...`);
          continue;
        }

        if (errStr.includes('429') || errStr.includes('quota') || err?.status === 429) {
          console.warn(`⚠️ Rate limited, rotating key...`);
          break;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini API requests failed.');
}

module.exports = {
  GEMINI_KEYS,
  withKeyRotation,
};