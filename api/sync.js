// Simple sync endpoint - guardar y cargar datos
// POST /api/sync?action=save → guarda los datos
// GET /api/sync?action=load → carga los datos

const fs = require('fs');
const path = require('path');

// Datos en memoria (en producción, usar base de datos)
let DB = {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action;
  const token = req.headers.authorization?.split(' ')[1];

  // Validar token simple
  if (!token || !['bety_token_2024', 'maxi_token_2024'].includes(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'save' && req.method === 'POST') {
    // Guardar datos
    try {
      const { reservations, cabanas, config } = req.body;

      if (!reservations || !Array.isArray(reservations)) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      // Guardar en memoria (en producción, usar Supabase)
      DB = {
        reservations,
        cabanas: cabanas || [],
        config: config || {},
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Data saved',
        timestamp: DB.updated_at
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (action === 'load' && req.method === 'GET') {
    // Cargar datos
    return res.status(200).json({
      success: true,
      data: DB,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
};
