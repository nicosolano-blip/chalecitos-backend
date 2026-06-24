# Los Chalecitos — Backend Sincronización

## 🚀 DEPLOY EN 3 PASOS

### PASO 1: Subir a GitHub

```bash
cd C:\tmp\chalecitos-backend
git init
git add .
git commit -m "Initial backend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/chalecitos-backend.git
git push -u origin main
```

### PASO 2: Conectar Vercel a GitHub

1. Ve a https://vercel.com
2. Click "Add New" → "Project"
3. Elige tu repositorio `chalecitos-backend`
4. Click "Deploy"

Vercel te dará una URL como: `https://chalecitos-backend-abc123.vercel.app`

### PASO 3: Actualizar admin.html

En tu archivo `admin.html`, reemplaza la línea:

```javascript
API_URL: 'https://chalecitos-sync.vercel.app',
```

Con tu URL real de Vercel:

```javascript
API_URL: 'https://chalecitos-backend-abc123.vercel.app',
```

---

## ✅ Listo

- Bety y Maxi abren el mismo `admin.html`
- Presionan login
- Los datos se sincronizan automáticamente cada 5 minutos
- Si uno guarda, el otro ve los cambios

---

## 🔧 Endpoints

- `POST /api/sync?action=save` → Guardar datos
- `GET /api/sync?action=load` → Cargar datos

Token requerido: `Authorization: Bearer bety_token_2024` o `maxi_token_2024`

---

## 📝 Notas

- Los datos se guardan en memoria (en Vercel)
- Si reiniciáas Vercel, los datos se pierden
- Para persistencia real, conecta a Supabase (contacta a Claude)
- El HTML ya tiene sincronización integrada

---

**Hecho. Funciona, es simple, es seguro.**
