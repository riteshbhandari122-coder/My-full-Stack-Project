const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { GEMINI_KEYS, withKeyRotation } = require('../utils/geminiClient');

const SYSTEM_INSTRUCTION = `You are the EcoMart AI Assistant — a helpful, friendly general-purpose assistant built into the EcoMart sustainable shopping platform in Nepal.`;

router.post('/chat', protect, async (req, res) => {
  try {
    if (GEMINI_KEYS.length === 0) {
      return res.status(500).json({ success: false, message: 'No Gemini API key set.' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required.' });
    }

    const toGeminiParts = (msg) => {
      const parts = [];
      if (msg.text) parts.push({ text: msg.text });
      if (msg.imageBase64) {
        const cleanBase64 = msg.imageBase64.includes(',') ? msg.imageBase64.split(',')[1] : msg.imageBase64;
        let mimeType = msg.mimeType || 'image/jpeg';
        if (msg.imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
        else if (msg.imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';
        parts.push({ inlineData: { data: cleanBase64, mimeType } });
      }
      return parts;
    };

    let history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: toGeminiParts(m),
    }));

    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const lastMessage = messages[messages.length - 1];
    const lastParts = toGeminiParts(lastMessage);

    const responseText = await withKeyRotation(async (genAI, modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
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