import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const client = createClient({
      connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Ключ не передан' });
    }

    const result = await client.query('SELECT * FROM keys WHERE key=$1', [key]);

    if (result.rowCount > 0) {
      res.status(200).json({ valid: true });
    } else {
      res.status(404).json({ valid: false });
    }

    await client.end();
  } catch (error) {
    console.error(error); // Важно, чтобы видеть в логах
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
