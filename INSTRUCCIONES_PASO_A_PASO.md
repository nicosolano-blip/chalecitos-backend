# 🚀 INSTRUCCIONES PASO A PASO - Deploy Backend

## Lo que tienes:
- ✅ Supabase URL
- ✅ Supabase Secret Key
- ✅ Supabase Publishable Key
- ✅ Contraseñas (bety2026, maxi26)
- ✅ Código de APIs listo

## LOS 5 PASOS (15 minutos totales)

### PASO 1: Crear tablas en Supabase (3 minutos)

1. Ve a https://app.supabase.com y login
2. Click en tu proyecto "enmskpcdfqopatpumcji"
3. En la barra izquierda, click en **"SQL Editor"**
4. Click en **"New Query"**
5. **Borra todo** y pega el contenido de **`schema.sql`** que está en esta carpeta
6. Click en **"Run"** (arriba a la derecha)

✅ **Listo.** Las tablas ya existen con datos iniciales.

---

### PASO 2: Generar JWT_SECRET (1 minuto)

Abre una terminal (PowerShell o CMD en Windows):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copia el resultado.** Será algo como: `a1b2c3d4e5f6...`

Guardalo en un lugar seguro. Lo usarás en el PASO 4.

---

### PASO 3: Crear cuenta en Vercel (2 minutos)

1. Ve a https://vercel.com
2. Click **"Sign Up"**
3. Elige **"Continue with GitHub"** (si tienes GitHub) o "Continue with Email"
4. Completa el signup

✅ **Listo.** Ya tienes cuenta en Vercel.

---

### PASO 4: Crear proyecto en Vercel y desplegar (5 minutos)

#### 4.1 - Crear proyecto

1. En Vercel, después de login, click en **"Add New"** → **"Project"**
2. Selecciona **"Other"** (en la parte de abajo)
3. Click en **"Clone Git Repository"** (o sube los archivos manualmente)
4. Si cloneas, pega esta URL (ejemplo):
   ```
   https://github.com/TU_USUARIO/chalecitos-backend
   ```
   (Si no tienes GitHub, puede hacer una carpeta local y subirla)

#### 4.2 - Configurar variables de entorno

Después de seleccionar el repo, Vercel te preguntará por **Environment Variables**:

Añade estas 3:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://enmskpcdfqopatpumcji.supabase.co` |
| `SUPABASE_SECRET` | `[TU_SUPABASE_SECRET_KEY]` |
| `JWT_SECRET` | `[El que generaste en PASO 2]` |

Click en cada campo y pega el valor correcto.

#### 4.3 - Deploy

Click en **"Deploy"**

Espera 2-3 minutos mientras Vercel instala dependencias y despliega.

✅ **Listo.** Cuando veas "Deployment successful", tu URL será:
```
https://chalecitos-backend-XXXXX.vercel.app
```

Copia esa URL. La necesitarás en el PASO 5.

---

### PASO 5: Actualizar admin.html (4 minutos)

Abre tu archivo `admin.html` en tu editor.

**Busca esta línea** (debería estar cerca del inicio del script):

```javascript
const DB_URL = 'http://localhost:3000'; // O algo similar
```

O si NO está, **añade esto al inicio del bloque `<script>`** después de abrir:

```javascript
const API_URL = 'https://chalecitos-backend-XXXXX.vercel.app';
const TOKEN_KEY = 'chalecitos_token';
```

Reemplaza `chalecitos-backend-XXXXX.vercel.app` con tu URL real de Vercel.

#### 5.1 - Actualizar función de login

**Busca la función que maneja el login** (probablemente se llama `loginUser()` o similar).

**Reemplaza el contenido** con esto:

```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login failed:', data.error);
      alert('Login fallido: ' + data.error);
      return false;
    }

    // Guardar token
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('Login exitoso:', data.user.name);
    loadReservations(); // Cargar reservaciones después del login
    return true;
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error de conexión');
    return false;
  }
}
```

#### 5.2 - Actualizar función que carga reservaciones

**Busca la función que carga las reservaciones** (probablemente `loadReservations()` o similar).

**Reemplaza** con esto:

```javascript
async function loadReservations() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('No token, mostrando localStorage como fallback');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/reservations/list`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to load reservations');
    }

    const data = await response.json();
    const reservations = data.reservations;

    console.log('Reservaciones cargadas:', reservations.length);
    // Aquí usa "reservations" en lugar de localStorage
    // Ejemplo: reservations.forEach(r => renderReservation(r));
  } catch (error) {
    console.error('Error cargando reservaciones:', error);
  }
}
```

#### 5.3 - Actualizar función que guarda reservaciones

**Busca la función que CREA reservaciones** (probablemente `saveReservation()`, `createReservation()`, etc.).

**Reemplaza** con esto:

```javascript
async function saveReservation(reservationData) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    alert('Debes loguearte primero');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/reservations/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    console.log('Reservación guardada:', data.reservation);
    
    // Recargar lista
    loadReservations();
    return true;
  } catch (error) {
    console.error('Error guardando:', error);
    alert('Error: ' + error.message);
    return false;
  }
}
```

#### 5.4 - Mantener localStorage como fallback

Si quieres que el HTML **también** guarde en localStorage de forma local (para que funcione offline):

```javascript
// Cada vez que crees una reservación:
if (window.DB) {
  window.DB.reservations = window.DB.reservations || [];
  window.DB.reservations.push(reservationData);
  localStorage.setItem('chalecitos_v1', JSON.stringify(window.DB));
}
```

---

## ✅ VERIFICACIÓN

Para verificar que todo funciona:

1. Abre `admin.html` en el navegador
2. Login con:
   - Email: `bety@chalecitos.local`
   - Password: `bety2026`
3. Debería mostrar "Login exitoso"
4. Las reservaciones deberían cargar desde Supabase

Si ves error 401 o 500:
- Verifica que las variables en Vercel sean exactas
- Revisa los logs en Vercel (proyecto → Deployments → Logs)

---

## 🚨 PROBLEMAS COMUNES

| Problema | Solución |
|----------|----------|
| `Error 404` en API | Verifica que `API_URL` sea la URL correcta de Vercel |
| `Error 401` en login | Verifica que email y password sean exactos (`bety@chalecitos.local`, `bety2026`) |
| `Error 500` en Supabase | Revisa que las variables de entorno estén correctas en Vercel |
| `CORS error` | Añade headers en Vercel (ver sección extra abajo) |

---

## EXTRA: Habilitar CORS (si tienes problemas)

Si ves error de CORS en el navegador, añade este archivo:

**`vercel.json`** en la raíz del proyecto:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

Y despliega de nuevo.

---

## 📞 AYUDA

Si algo falla:
1. Abre console del navegador (F12)
2. Mira los errores en rojo
3. Copia el error y búscalo en Google
4. Verifica que todos los valores sean exactos

**¡Ya está!** 🎉

Tu plataforma ahora es segura, con contraseñas hasheadas y datos en la nube.

