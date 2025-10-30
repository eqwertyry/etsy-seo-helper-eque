console.log('TEST API LOADED'); // Добавьте эту строку

export default async function handler(req, res) {
  console.log('TEST API CALLED'); // И эту
  return res.status(200).json({ 
    message: '✅ Test API работает!',
    timestamp: new Date().toISOString()
  });
}
