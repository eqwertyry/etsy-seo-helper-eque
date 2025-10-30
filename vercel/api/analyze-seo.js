import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Разрешаем запросы откуда угодно
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы' });
  }

  const { productTitle, productDescription, tags, category } = req.body;

  if (!productTitle || !productDescription) {
    return res.status(400).json({ 
      error: 'Название и описание товара обязательны' 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Ты эксперт по SEO для Etsy. Проанализируй этот товар:

НАЗВАНИЕ: ${productTitle}
ОПИСАНИЕ: ${productDescription}
ТЕГИ: ${tags || 'не указаны'}
КАТЕГОРИЯ: ${category || 'не указана'}

Дай ответ в таком JSON формате:

{
  "seo_score": "число от 1 до 100",
  "title_analysis": {
    "score": "число от 1 до 10", 
    "strengths": ["сильные стороны"],
    "improvements": ["что улучшить"]
  },
  "description_analysis": {
    "score": "число от 1 до 10",
    "strengths": ["сильные стороны"],
    "improvements": ["что улучшить"]
  },
  "keyword_suggestions": {
    "primary": ["3-5 основных ключей"],
    "long_tail": ["3-5 длинных запросов"],
    "trending": ["2-3 трендовых ключа"]
  },
  "optimization_tips": [
    "3-5 практических совета"
  ]
}

Только JSON, без другого текста.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Очищаем ответ
    const cleanText = text.replace(/```json|```/g, '').trim();

    return res.status(200).json(JSON.parse(cleanText));

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Ошибка анализа SEO',
      details: error.message 
    });
  }
}