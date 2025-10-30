import { Client } from 'pg';

export default async function handler(req, res) {
  // Заголовки для CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Только POST запросы' });

  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Ключ обязателен' });

  // Подключение к базе
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // твой URL базы должен быть в env
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT key, is_used FROM activation_keys WHERE key = $1 LIMIT 1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '❌ Неверный ключ активации' });
    }

    if (result.rows[0].is_used) {
      return res.status(401).json({ error: '⚠️ Ключ уже использован' });
    }

    // Возвращаем успех
    return res.status(200).json({
      success: true,
      message: '✅ Ключ активирован!',
    });
  } catch (err) {
    console.error('Activation error:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
}

