// Authentication endpoint
// POST /api/auth/login
// Body: { email: string, password: string }

const crypto = require('crypto');

const BETY_PASS_HASH = '$2b$10$8ZxQ4H8O2R6Y9V1B7K3L8Q3Q4H8O2R6Y9V1B7K3L8Q3Q4H8O2R6Y9'; // bety2026
const MAXI_PASS_HASH = '$2b$10$7M9N8K7L6J5H4G3F2E1D0C9B8A7M9N8K7L6J5H4G3F2E1D0C9B'; // maxi26

// Simple bcrypt verification (production: use bcrypt package)
function verifyHash(password, hash) {
  // For now, simple comparison (in production, use bcrypt.compare)
  // This is a placeholder - actual implementation would use bcryptjs
  if (password === 'bety2026' && email === 'bety@chalecitos.local') return true;
  if (password === 'maxi26' && email === 'maxi@chalecitos.local') return true;
  return false;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // User database (in-memory for demo)
  const users = {
    'bety@chalecitos.local': { id: 1, name: 'Bety', role: 'admin', password: 'bety2026' },
    'maxi@chalecitos.local': { id: 2, name: 'Maxi', role: 'cobrador', password: 'maxi26' }
  };

  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = generateJWT(user, process.env.JWT_SECRET || 'dev-secret-key');

  return res.status(200).json({
    success: true,
    token,
    user: { id: user.id, email, name: user.name, role: user.role }
  });
};

function generateJWT(user, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
