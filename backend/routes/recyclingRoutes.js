const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { GEMINI_KEYS, withKeyRotation } = require('../utils/geminiClient');
const {
  submitRecycling,
  getMyRecycling,
  getAllRecycling,
  updateRecyclingStatus,
} = require('../controllers/recyclingController');

router.post('/', protect, submitRecycling);
router.get('/my', protect, getMyRecycling);
router.get('/', getAllRecycling);
router.put('/:id', protect, updateRecyclingStatus);

router.post('/analyze', async (req, res) => {
  try {
    if (GEMINI_KEYS.length === 0) {
      console.error('❌ No Gemini API key configured (GEMINI_API_KEY or GEMINI_API_KEYS).');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: no Gemini API key set on Render.',
      });
    }

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No image provided.',
      });
    }

    const prompt = `
      You are an expert waste sorting and eco-upcycling assistant.
      Examine the uploaded image carefully.

      Identify:
      1. What the item is (e.g., "Plastic Water Bottle", "Cardboard Box", "Glass Jar", "Aluminum Can").
      2. The material composition (e.g., "PET Plastic (#1)", "Corrugated Paperboard", "Aluminum").
      3. Whether it is standardly recyclable (set isRecyclable to true/false).
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

    const responseText = await withKeyRotation(async (genAI, modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    });

    let cleanedJsonText = responseText.trim();
    if (cleanedJsonText.startsWith('```json')) {
      cleanedJsonText = cleanedJsonText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedJsonText.startsWith('```')) {
      cleanedJsonText = cleanedJsonText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.warn('⚠️ Standard JSON parse failed, attempting minor structural cleanup...');
      const fixedText = cleanedJsonText
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');

      parsedData = JSON.parse(fixedText);
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('❌ Gemini Vision AI Error:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: `Gemini Error: ${error?.message || 'Unknown server error'}`,
    });
  }
});

module.exports = router;