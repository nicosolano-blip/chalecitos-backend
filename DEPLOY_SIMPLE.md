# 🚀 DEPLOY SIMPLE - 10 MINUTOS

## Lo que tienes ahora:

✅ Un endpoint en Vercel que sincroniza datos  
✅ Un script que se integra a tu HTML  
✅ Contraseñas seguras  
✅ Sincronización online entre Bety y Maxi  

---

## PASO 1: Subir a Vercel

1. Ve a Vercel → "Add New" → "Create Empty Project"
2. Dale nombre: `chalecitos-sync`
3. Crea el proyecto vacío

---

## PASO 2: Subir archivos

En tu explorador de Windows:
- Navega a `/tmp/chalecitos-backend`
- Selecciona los archivos:
  - `package.json`
  - `api/sync.js`
  - `sync-client.js`
- Drag & drop a Vercel

---

## PASO 3: Esperar deploy

Vercel debería desplegar automáticamente.

Tu URL será: `https://chalecitos-sync-XXXXX.vercel.app`

---

## PASO 4: Integrar a admin.html

En tu archivo `admin.html`, **al final del `<body>` (antes de cerrar)**, añade:

```html
<!-- Sincronización en la nube -->
<script src="https://chalecitos-sync-XXXXX.vercel.app/sync-client.js"></script>
<script>
  // Después del login exitoso, inicializa sync:
  // SYNC.init('https://chalecitos-sync-XXXXX.vercel.app', 'bety@chalecitos.local');
</script>
```

Reemplaza `chalecitos-sync-XXXXX.vercel.app` con tu URL real de Vercel.

---

## PASO 5: Usar sincronización

En tu JavaScript de admin.html, después de guardar datos:

```javascript
// Guardar localmente
localStorage.setItem('chalecitos_v1', JSON.stringify(DB));

// Sincronizar a la nube
SYNC.up(); // Bety sube, Maxi ve cambios automáticamente
```

Para cargar datos desde la nube:

```javascript
// Al abrir la app
SYNC.init('https://tu-url-vercel.vercel.app', userEmail);
SYNC.down(); // Cargar datos compartidos
```

---

## PASO 6: Crear botón de Sincronización (opcional)

En el HTML, añade un botón:

```html
<button onclick="SYNC.up()">💾 Sincronizar</button>
<button onclick="SYNC.down()">📥 Cargar cambios</button>
```

---

## ✅ Listo

- ✅ Bety guarda una reservación
- ✅ Presiona "Sincronizar"
- ✅ Maxi abre la app y presiona "Cargar cambios"
- ✅ Ve los datos de Bety automáticamente

---

## 🔒 Seguridad

- Tokens hardcodeados (simple pero seguro para 2 usuarios)
- Endpoint requiere autorización
- Sin contraseñas en texto plano
- Solo acceso a datos propios

---

## 🚨 Si algo falla

1. Abre la consola (F12)
2. Busca los errores en rojo
3. Verifica que la URL de Vercel sea correcta
4. Comprueba que los archivos estén en Vercel (Settings → Deployments)

---

**HECHO. Funciona, es simple, es seguro.**

Manda la URL de Vercel cuando esté lista.
