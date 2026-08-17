const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

let keyIndex = 0;

const isQuotaError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('quota') || msg.includes('rate limit') || msg.includes('429') || msg.includes('resource_exhausted');
};

async function withKeyRotation(runFn) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('No Gemini API key configured in .env file.');
  }

  let lastError = null;

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
    const genAI = new GoogleGenerativeAI(key);

    try {
      return await runFn(genAI, 'gemini-1.5-flash');
    } catch (err) {
      lastError = err;
      if (isQuotaError(err)) {
        console.warn(`⚠️ Key index ${keyIndex} hit quota, trying next key...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini API keys failed.');
}

module.exports = { GEMINI_KEYS, withKeyRotation };