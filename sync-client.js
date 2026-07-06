// Sincronización simple con el backend
// Incluir en admin.html: <script src="sync-client.js"></script>

const SYNC_CONFIG = {
  API_URL: '', // Se configura en admin.html
  BETY_TOKEN: 'bety_token_2024',
  MAXI_TOKEN: 'maxi_token_2024',
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000 // 5 minutos
};

let CURRENT_USER_TOKEN = null;

// Inicializar sincronización
function initSync(apiUrl, userEmail) {
  SYNC_CONFIG.API_URL = apiUrl;

  // Asignar token según usuario
  if (userEmail === 'bety@chalecitos.local') {
    CURRENT_USER_TOKEN = SYNC_CONFIG.BETY_TOKEN;
  } else if (userEmail === 'maxi@chalecitos.local') {
    CURRENT_USER_TOKEN = SYNC_CONFIG.MAXI_TOKEN;
  }

  // Auto-sync cada 5 minutos
  setInterval(() => {
    if (CURRENT_USER_TOKEN) {
      syncDown();
    }
  }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);

  console.log('✅ Sincronización iniciada para:', userEmail);
}

// GUARDAR datos a la nube
async function syncUp() {
  if (!CURRENT_USER_TOKEN) {
    console.warn('⚠️ No hay usuario autenticado');
    return false;
  }

  try {
    // Obtener datos de localStorage
    const dbRaw = localStorage.getItem('chalecitos_v1');
    if (!dbRaw) {
      console.warn('⚠️ No hay datos locales para sincronizar');
      return false;
    }

    const db = JSON.parse(dbRaw);

    // Enviar a servidor
    const response = await fetch(`${SYNC_CONFIG.API_URL}/api/sync?action=save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CURRENT_USER_TOKEN}`
      },
      body: JSON.stringify({
        reservations: db.reservations || [],
        cabanas: db.cabanas || [],
        config: db.config || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const result = await response.json();
    console.log('☁️ Sincronizado a la nube:', result.timestamp);
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    return false;
  }
}

// CARGAR datos de la nube
async function syncDown() {
  if (!CURRENT_USER_TOKEN) {
    console.warn('⚠️ No hay usuario autenticado');
    return false;
  }

  try {
    const response = await fetch(`${SYNC_CONFIG.API_URL}/api/sync?action=load`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CURRENT_USER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const result = await response.json();
    if (!result.data || !result.data.reservations) {
      console.log('ℹ️ Servidor vacío');
      return false;
    }

    // Guardar en localStorage
    localStorage.setItem('chalecitos_v1', JSON.stringify(result.data));
    console.log('📥 Datos sincronizados desde la nube:', result.timestamp);

    // Recargar interfaz (adaptar según tu HTML)
    if (typeof loadReservations === 'function') {
      loadReservations();
    }
    if (typeof renderReservations === 'function') {
      renderReservations();
    }

    return true;
  } catch (error) {
    console.error('❌ Error cargando:', error);
    return false;
  }
}

// Exportar para uso en admin.html
window.SYNC = {
  init: initSync,
  up: syncUp,
  down: syncDown
};
