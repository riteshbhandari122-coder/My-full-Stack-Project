const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Gemini API Key Rotation ───────────────────────────────────────────────
// Supports multiple keys via GEMINI_API_KEYS (comma-separated), falling back
// to the single GEMINI_API_KEY if that's all that's set. Requests round-robin
// across keys, and if a key hits a quota/rate-limit error specifically, the
// request automatically retries with the next key instead of failing.
const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

let keyIndex = 0; // rotates across requests for even load distribution

const isQuotaError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('quota') || msg.includes('rate limit') || msg.includes('429') || msg.includes('resource_exhausted');
};

// Tries each key in the pool (starting from the rotating pointer) until one
// succeeds. Only retries on quota/rate-limit errors — other errors (bad
// image, bad prompt, etc.) fail immediately since a different key won't help.
// `runFn` receives a configured GoogleGenerativeAI instance and does the work.
async function withKeyRotation(runFn) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('No Gemini API key configured. Set GEMINI_API_KEY or GEMINI_API_KEYS.');
  }

  let lastError = null;

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;

    try {
      const genAI = new GoogleGenerativeAI(key);
      return await runFn(genAI);
    } catch (err) {
      lastError = err;
      if (!isQuotaError(err)) {
        throw err; // real error, not a quota issue — no point trying another key
      }
      console.warn(`⚠️ Gemini key ${attempt + 1}/${GEMINI_KEYS.length} hit quota/rate limit, trying next key...`);
    }
  }

  throw lastError || new Error('All Gemini API keys exhausted');
}

module.exports = { GEMINI_KEYS, withKeyRotation };