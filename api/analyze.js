import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы' });
  }

  const { productTitle, key } = req.body;

  // Проверка ключа
  if (!key) {
    return res.status(400).json({ error: 'Ключ обязателен' });
  }

  try {
    // Проверяем ключ в базе
    const keyResult = await sql`
      SELECT key, is_used FROM seo_keys 
      WHERE key = ${key}
    `;

    if (keyResult.rows.length === 0) {
      return res.status(401).json({ error: '❌ Неверный ключ активации' });
    }

    if (keyResult.rows[0].is_used) {
      return res.status(401).json({ error: '⚠️ Ключ уже использован' });
    }

    // Если ключ валиден, возвращаем успех
    return res.status(200).json({ 
      success: true,
      message: '✅ Ключ активирован!'
    });

  } catch (error) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}