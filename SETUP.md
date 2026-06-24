# Configuración del Backend - Los Chalecitos

## Credenciales que tienes

```
SUPABASE_URL = https://enmskpcdfqopatpumcji.supabase.co
SUPABASE_PUBLISHABLE = sb_publishable_XUEJ_9iFTsrynkOFTUvbRQ_04IQ6o7Q
SUPABASE_SECRET = sb_secret_FZoENLSAA0WfsQ7wf6N4MQ_6NvD3hYa
JWT_SECRET = tu-secret-key-aqui (genera uno aleatorio)
```

## Paso 1: Crear tablas en Supabase

Ve a tu panel de Supabase: https://app.supabase.com/projects

Abre la consola SQL (SQL Editor) y ejecuta esto:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cobrador',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reservaciones
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE NOT NULL,
  cabanas JSONB,
  personas INTEGER,
  precio_total DECIMAL(10,2),
  observaciones TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de cabañas
CREATE TABLE cabanas (
  id SERIAL PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  capacidad INTEGER NOT NULL,
  descripcion TEXT,
  precio_noche DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar usuarios iniciales
INSERT INTO users (email, name, role, password_hash) VALUES
  ('bety@chalecitos.local', 'Bety', 'admin', 'HASH_bety2026'),
  ('maxi@chalecitos.local', 'Maxi', 'cobrador', 'HASH_maxi26');

-- Insertar cabañas ejemplo
INSERT INTO cabanas (numero, capacidad, descripcion, precio_noche) VALUES
  (1, 4, 'Cabaña con vista a montaña', 150.00),
  (2, 6, 'Cabaña familiar grande', 180.00),
  (3, 4, 'Cabaña con chimenea', 160.00),
  (4, 2, 'Cabaña romántica', 120.00),
  (5, 4, 'Cabaña con balcón', 155.00),
  (6, 6, 'Cabaña premium', 200.00),
  (7, 4, 'Cabaña estándar', 145.00),
  (8, 3, 'Cabaña cozy', 130.00);
```

## Paso 2: Generar un JWT_SECRET

Genera una clave aleatoria segura. En la terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado. Será tu `JWT_SECRET`.

## Paso 3: Crear proyecto en Vercel

1. Ve a https://vercel.com
2. Login o regístrate (puedes usar GitHub)
3. Click "New Project"
4. **NO conectes a GitHub todavía** - primero vamos a subir los archivos

## Paso 4: Subir código a GitHub (opcional pero recomendado)

Si quieres conectar a GitHub:

```bash
cd chalecitos-backend
git init
git add .
git commit -m "Initial backend setup"
git remote add origin https://github.com/TU_USUARIO/chalecitos-backend.git
git push -u origin main
```

Si prefieres subir a Vercel sin GitHub:
- En Vercel, elige "Other" → "Clone Git Repository"
- O sube los archivos directo en el panel

## Paso 5: Configurar Environment Variables en Vercel

En tu proyecto de Vercel, ve a **Settings → Environment Variables**

Añade:
```
SUPABASE_URL = https://enmskpcdfqopatpumcji.supabase.co
SUPABASE_SECRET = sb_secret_FZoENLSAA0WfsQ7wf6N4MQ_6NvD3hYa
JWT_SECRET = [tu-clave-generada]
NODE_ENV = production
```

## Paso 6: Deploy a Vercel

En el panel de Vercel, click "Deploy"

Vercel va a detectar el `package.json` y desplegar automáticamente.

Una vez desplegado, tu URL será algo como:
```
https://chalecitos-backend-abc123.vercel.app
```

## Paso 7: Actualizar admin.html

En tu HTML, reemplaza las llamadas `localStorage` con llamadas a la API:

```javascript
// Login
const response = await fetch('https://tu-backend-url.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'bety@chalecitos.local', password: 'bety2026' })
});

const { token } = await response.json();
localStorage.setItem('token', token);
```

```javascript
// Obtener reservaciones
const token = localStorage.getItem('token');
const response = await fetch('https://tu-backend-url.vercel.app/api/reservations/list', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { reservations } = await response.json();
```

## Paso 8: Migración de datos

1. Exporta tus datos actuales desde localStorage:
   - En admin.html, abre la consola del navegador
   - Ejecuta: `copy(JSON.stringify(JSON.parse(localStorage.getItem('chalecitos_v1'))))`

2. Importa en Supabase manualmente o vía script

## Pruebas

Para probar localmente:

```bash
# Instala node-fetch si no está
npm install node-fetch

# Test de login
node -e "
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'bety@chalecitos.local', password: 'bety2026' })
}).then(r => r.json()).then(console.log)
"
```

## Soporte

Si algo falla:
1. Revisa los logs de Vercel en el panel
2. Verifica que las variables de entorno estén correctas
3. Comprueba que Supabase tenga acceso desde Vercel (sin restricciones IP)

---

**Resumen:** 3 pasos principales:
1. ✅ Crear tablas en Supabase SQL
2. ✅ Generar JWT_SECRET
3. ✅ Deploy en Vercel con environment variables
4. ✅ Actualizar HTML con nuevas URLs de API
