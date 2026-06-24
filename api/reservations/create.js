// Create a new reservation
// POST /api/reservations/create
// Headers: Authorization: Bearer {token}
// Body: { tipo, cabanas, personas, precio_total, observaciones, etc }

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const payload = verifyJWT(token, process.env.JWT_SECRET || 'dev-secret-key');
    const reservationData = req.body;

    if (!reservationData.tipo || !reservationData.fecha_desde) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET;

    const response = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...reservationData,
        created_by: payload.email,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(400).json({ error: 'Failed to create reservation', details: error });
    }

    const reservation = await response.json();
    return res.status(201).json({ success: true, reservation: reservation[0] });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

function verifyJWT(token, secret) {
  const [header, payload, signature] = token.split('.');

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return decoded;
}
