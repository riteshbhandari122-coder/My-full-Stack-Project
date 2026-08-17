const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { GEMINI_KEYS, withKeyRotation } = require('../utils/geminiClient');

// ─── EcoMart AI Assistant ──────────────────────────────────────────────────
// A real conversational assistant: free-form text, general questions, and
// image uploads (e.g. "what is this, can I recycle it?" or anything else),
// with full multi-turn memory sent from the frontend each request.
//
// POST /api/ai/chat
// Body: {
//   messages: [{ role: 'user'|'assistant', text: string, imageBase64?: string, mimeType?: string }],
// }
// The frontend sends the FULL conversation history each time (stateless
// backend) — this mirrors how Claude/Gemini/ChatGPT-style chat APIs work.

const SYSTEM_INSTRUCTION = `You are the EcoMart AI Assistant — a helpful, friendly general-purpose
assistant built into the EcoMart sustainable shopping platform in Nepal.
You can answer any question, have normal conversations, and analyze photos
the user uploads (identifying items, suggesting recycling/upcycling ideas,
or just describing/answering questions about the image — whatever the user
actually asks). You are not limited to eco topics; be a genuinely useful,
general-purpose assistant, while naturally leaning on your sustainability
knowledge when it's relevant. Keep responses clear and conversational.`;

router.post('/chat', protect, async (req, res) => {
  try {
    if (GEMINI_KEYS.length === 0) {
      console.error('❌ No Gemini API key configured (GEMINI_API_KEY or GEMINI_API_KEYS).');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: no Gemini API key set on Render.',
      });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'messages array is required.',
      });
    }

    // Build Gemini-format conversation history from our simplified message shape.
    // Gemini's history format is: [{ role: 'user'|'model', parts: [...] }]
    // The LAST message is sent separately as the new turn; everything before
    // it becomes prior history so the model has real multi-turn memory.
    const toGeminiParts = (msg) => {
      const parts = [];
      if (msg.text) parts.push({ text: msg.text });
      if (msg.imageBase64) {
        const cleanBase64 = msg.imageBase64.includes(',')
          ? msg.imageBase64.split(',')[1]
          : msg.imageBase64;
        let mimeType = msg.mimeType || 'image/jpeg';
        if (msg.imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
        else if (msg.imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';
        parts.push({ inlineData: { data: cleanBase64, mimeType } });
      }
      return parts;
    };

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: toGeminiParts(m),
    }));

    const lastMessage = messages[messages.length - 1];
    const lastParts = toGeminiParts(lastMessage);

    if (lastParts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The last message must include text and/or an image.',
      });
    }

    const responseText = await withKeyRotation(async (genAI) => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastParts);
      return result.response.text();
    });

    res.json({ success: true, reply: responseText });
  } catch (error) {
    console.error('❌ AI Assistant error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: `AI Assistant error: ${error?.message || 'Unknown server error'}`,
    });
  }
});

module.exports = router;