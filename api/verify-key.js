import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы' });
  }

  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Ключ обязателен' });
  }

  try {
    // Проверяем ключ в базе
    const result = await sql`
      SELECT key, is_used FROM seo_keys 
      WHERE key = ${key}
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        error: '❌ Ключ не найден' 
      });
    }

    const keyData = result.rows[0];

    if (keyData.is_used) {
      return res.status(400).json({ 
        valid: false, 
        error: '⚠️ Ключ уже использован' 
      });
    }

    // Активируем ключ
    await sql`
      UPDATE seo_keys 
      SET is_used = true, used_at = NOW()
      WHERE key = ${key}
    `;

    return res.status(200).json({ 
      valid: true, 
      message: '✅ Ключ активирован! Доступ открыт.' 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}