// Get all reservations
// GET /api/reservations/list
// Headers: Authorization: Bearer {token}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  // Verify token
  try {
    const payload = verifyJWT(token, process.env.JWT_SECRET || 'dev-secret-key');

    // Fetch from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET;

    const response = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Supabase error');
    }

    const reservations = await response.json();
    return res.status(200).json({ success: true, reservations });
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
