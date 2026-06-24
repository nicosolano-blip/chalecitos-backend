// Sync endpoint con Supabase - guardar y cargar datos de forma SEGURA
// POST /api/sync?action=save → guarda en Supabase (PERSISTENTE)
// GET /api/sync?action=load → carga desde Supabase (SEGURO)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://enmskpcdfqopatpumcji.supabase.co';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET || 'sb_secret_FZoENLSAA0WfsQ7wf6N4MQ_6NvD3hYa';

async function saveToSupabase(key, data, user) {
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/sync_data`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SECRET}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        key,
        data,
        updated_by: user
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase error: ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

async function loadFromSupabase(key) {
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/sync_data`);
    url.searchParams.append('key', `eq.${key}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load from Supabase');
    }

    const data = await response.json();
    return data.length > 0 ? data[0].data : null;
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action;
  const token = req.headers.authorization?.split(' ')[1];

  // Validar token
  const user = token === 'bety_token_2024' ? 'bety' : token === 'maxi_token_2024' ? 'maxi' : null;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'save' && req.method === 'POST') {
    try {
      const { reservations } = req.body;

      if (!Array.isArray(reservations)) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      await saveToSupabase('chalecitos_reservations', reservations, user);

      return res.status(200).json({
        success: true,
        message: 'Data saved securely to Supabase',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save data', details: error.message });
    }
  }

  if (action === 'load' && req.method === 'GET') {
    try {
      const data = await loadFromSupabase('chalecitos_reservations');

      return res.status(200).json({
        success: true,
        data: { reservations: data || [] },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to load data', details: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
};
