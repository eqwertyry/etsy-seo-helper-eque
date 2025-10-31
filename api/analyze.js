import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // ✅ Разрешаем CORS для всех доменов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Обрабатываем предварительный запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы' });
  }

  try {
    // ✅ Парсим тело запроса (req.body может быть строкой на Vercel)
    const { productTitle, key } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!key) {
      return res.status(400).json({ error: 'Ключ обязателен' });
    }

    // ✅ Проверяем ключ
    const keyResult = await sql`
      SELECT key, is_used FROM activation_key
      WHERE key = ${key}
    `;

    if (keyResult.rows.length === 0) {
      return res.status(401).json({ error: '❌ Неверный ключ активации' });
    }

    if (keyResult.rows[0].is_used) {
      return res.status(401).json({ error: '⚠️ Ключ уже использован' });
    }

    // ✅ Всё ок
    return res.status(200).json({
      valid: true,
      message: '✅ Ключ активирован!',
    });
  } catch (error) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: 'Ошибка сервера', details: error.message });
  }
}