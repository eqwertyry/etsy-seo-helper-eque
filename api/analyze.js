import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'No key provided' });

    // Проверка ключа в базе
    const client = await sql.connect();
    const result = await client.sql`SELECT * FROM keys WHERE key = ${key} LIMIT 1`;
    
    if (result.rowCount === 0) return res.status(401).json({ valid: false, error: 'Invalid key' });

    res.status(200).json({ valid: true });
  } catch (err) {
    console.error('API Analyze error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
