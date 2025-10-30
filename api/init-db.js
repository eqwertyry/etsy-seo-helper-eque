import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Создаем таблицу для ключей
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS seo_keys (
        key VARCHAR(255) PRIMARY KEY,
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Добавляем тестовый ключ
    const testKey = 'ETSY-SEO-TEST123';
    await sql`
      INSERT INTO seo_keys (key) 
      VALUES (${testKey})
      ON CONFLICT (key) DO NOTHING;
    `;

    return response.status(200).json({ 
      message: '✅ База данных готова!',
      test_key: testKey 
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}