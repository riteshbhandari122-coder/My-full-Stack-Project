const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 🤖 AI Vision Upcycle & Recycling Analysis
router.post('/analyze', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing from environment variables.');
      return res.status(500).json({ 
        success: false, 
        message: 'Server misconfiguration: GEMINI_API_KEY missing on Render.' 
      });
    }

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided.' 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash', // Updated to active model endpoint
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an expert waste sorting and eco-upcycling assistant.
      Examine the uploaded image carefully.

      Identify:
      1. What the item is (e.g., "Plastic Water Bottle", "Cardboard Box", "Glass Jar", "Aluminum Can").
      2. The material composition (e.g., "PET Plastic (#1)", "Corrugated Paperboard", "Aluminum").
      3. Whether it is standardly recyclable (e.g. PET Plastic bottles are Recyclable -> set isRecyclable to true).
      4. Provide 2-3 creative, practical DIY upcycling or reuse ideas at home with step-by-step instructions.
      5. Provide a brief disposal or cleaning tip.

      Strictly output valid JSON adhering to this exact schema:
      {
        "identifiedItem": "string",
        "materialType": "string",
        "isRecyclable": boolean,
        "upcycleIdeas": [
          {
            "title": "string",
            "category": "Gardening / Home Decor / Storage / Craft",
            "timeRequired": "string",
            "steps": ["string"]
          }
        ],
        "disposalTip": "string"
      }
    `;

    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    let detectedMime = mimeType || 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) detectedMime = 'image/png';
    else if (imageBase64.startsWith('data:image/webp')) detectedMime = 'image/webp';

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: detectedMime,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    return res.json(JSON.parse(responseText));
  } catch (error) {
    console.error('❌ Gemini Vision AI Error:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: `Gemini Error: ${error?.message || 'Unknown server error'}`,
    });
  }
});

module.exports = router;