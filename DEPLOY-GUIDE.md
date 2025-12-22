# 🚀 Guía de Despliegue - Taller Rivera

## Opción 1: Vercel (Recomendada - GRATIS)

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub" (usa la misma cuenta donde tienes este repo)
4. Autoriza Vercel para acceder a tus repositorios

### Paso 2: Importar el proyecto
1. Una vez dentro de Vercel, haz clic en "Add New..." → "Project"
2. Busca el repositorio `tallerRivera`
3. Haz clic en "Import"

### Paso 3: Configurar el proyecto
En la pantalla de configuración:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (ya está configurado)
- **Output Directory**: `dist` (ya está configurado)
- **Install Command**: `npm install` (ya está configurado)

### Paso 4: Agregar variables de entorno
⚠️ **MUY IMPORTANTE**: Debes configurar tus credenciales de Supabase

1. En la sección "Environment Variables", agrega:
   - **VITE_SUPABASE_URL**: Tu URL de Supabase (ej: https://tu-proyecto.supabase.co)
   - **VITE_SUPABASE_ANON_KEY**: Tu clave anónima de Supabase

2. Para obtener estas credenciales:
   - Ve a tu proyecto en Supabase
   - Click en Settings (⚙️) → API
   - Copia "Project URL" y "anon public" key

### Paso 5: Deploy
1. Haz clic en "Deploy"
2. Espera 1-2 minutos mientras Vercel construye tu proyecto
3. ¡Listo! Tu sitio estará en línea en una URL como: `https://taller-rivera.vercel.app`

### 🔄 Actualizaciones automáticas
Cada vez que hagas `git push origin main`, Vercel automáticamente:
- Detecta los cambios
- Reconstruye el proyecto
- Actualiza el sitio en vivo
- ¡Sin hacer nada más!

---

## Opción 2: Netlify (Alternativa GRATIS)

### Paso 1: Crear cuenta
1. Ve a https://netlify.com
2. Sign up con GitHub

### Paso 2: Nuevo sitio
1. Click en "Add new site" → "Import an existing project"
2. Selecciona GitHub
3. Busca `tallerRivera`

### Paso 3: Configuración
- Build command: `npm run build`
- Publish directory: `dist`

### Paso 4: Variables de entorno
En Site settings → Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Paso 5: Deploy
- Click en "Deploy site"
- URL: `https://taller-rivera.netlify.app`

---

## Opción 3: GitHub Pages (Solo para sitios estáticos)

⚠️ **NO RECOMENDADA** para este proyecto porque:
- No soporta variables de entorno seguras
- Requiere configuración adicional compleja
- No es ideal para aplicaciones con autenticación

---

## 📝 Notas Importantes

### 1. Variables de entorno
Tu archivo `.env` NO se sube a GitHub (está en .gitignore).
Por eso DEBES configurar las variables en Vercel/Netlify.

### 2. Seguridad de Supabase
Las claves que usas (`VITE_SUPABASE_ANON_KEY`) son seguras de exponer en el frontend porque:
- Solo tienen permisos limitados
- Supabase RLS protege tus datos
- La clave real de servicio NUNCA se expone

### 3. Dominio personalizado (opcional)
Vercel/Netlify permiten agregar tu propio dominio gratis:
- Ejemplo: `www.tallerrivera.com`
- Solo necesitas comprar el dominio (aprox $12/año)
- La configuración es guiada y automática

### 4. Límites gratuitos
**Vercel:**
- 100 GB bandwidth/mes
- Deploy ilimitados
- Más que suficiente para un taller

**Netlify:**
- 100 GB bandwidth/mes
- 300 minutos build/mes
- También suficiente

---

## ✅ Checklist antes de deploy

- [ ] Ejecutaste el script SQL en Supabase (`supabase-clientes-setup.sql`)
- [ ] Creaste el usuario admin en Supabase Authentication
- [ ] Tienes las credenciales de Supabase (URL y anon key)
- [ ] El proyecto funciona correctamente en local (http://localhost:3000)
- [ ] Hiciste commit y push de todos los cambios a GitHub

---

## 🆘 Solución de problemas

### Error: "Build failed"
- Verifica que `package.json` tenga `"build": "vite build"`
- Revisa que las variables de entorno estén configuradas

### Error: "Page not found" al navegar
- Vercel/Netlify ya están configurados con `vercel.json` para SPA routing
- Si persiste, revisa que el archivo `vercel.json` exista

### Error: "Supabase connection failed"
- Verifica las variables de entorno en Vercel/Netlify
- Asegúrate que copiaste correctamente la URL y key

### La página se ve en blanco
- Abre DevTools (F12) → Console
- Busca errores relacionados con Supabase
- Verifica que las políticas RLS estén configuradas

---

## 🎉 Resultado Final

Una vez desplegado, tendrás:
- ✅ Sitio web 24/7 en línea
- ✅ HTTPS automático (seguro)
- ✅ Actualizaciones automáticas con git push
- ✅ Sin costos mensuales
- ✅ Backups automáticos
- ✅ Métricas de uso y analytics

**URL de ejemplo:** `https://taller-rivera.vercel.app`

---

## 📞 Soporte

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
