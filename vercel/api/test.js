export default async function handler(req, res) {
  return res.status(200).json({ 
    message: '✅ Всё работает! API готов к разработке.',
    status: 'success',
    next_step: 'Теперь создай базу данных в Vercel'
  });
}