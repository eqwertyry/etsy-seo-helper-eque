import { createClient } from '@vercel/postgres';

const client = createClient({
  connectionString: process.env.DATABASE_URL
});

export default async function handler(req, res) {
  const { key } = req.body;

  await client.connect();

  const result = await client.query('SELECT * FROM keys WHERE key=$1', [key]);

  if (result.rowCount > 0) {
    res.status(200).json({ valid: true });
  } else {
    res.status(404).json({ valid: false });
  }
}
