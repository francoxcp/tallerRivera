# 🔧 Taller Rivera - Sistema de Gestión de Facturas

Sistema web moderno para gestionar facturas de un taller mecánico, desarrollado con React, Vite y Supabase.

## 📋 Características

- ✅ Registro de facturas con número, precios y detalles
- 🔍 Búsqueda por número de factura
- 🎯 Filtrado por estado de pago (pagado/pendiente)
- ✏️ Edición y eliminación de facturas
- 📊 Visualización clara de totales
- 🎨 Interfaz moderna y responsive con TailwindCSS

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSCSS
- **Backend**: Supabase (PostgreSQL + API REST)
- **Lenguaje**: JavaScript (ES6+)

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd "d:\Visual Studio Code Proyectos\TallerRivera"
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar Supabase

#### Crear cuenta en Supabase:
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

#### Crear la tabla en Supabase:
1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Ejecuta el siguiente script SQL:

```sql
-- Crear la tabla de facturas
CREATE TABLE facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT NOT NULL UNIQUE,
  precio_repuesto DECIMAL(10,2) DEFAULT 0,
  precio_servicio DECIMAL(10,2) DEFAULT 0,
  detalle TEXT,
  estado_pago TEXT NOT NULL CHECK (estado_pago IN ('pagado', 'pendiente')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas más rápidas
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX idx_facturas_estado ON facturas(estado_pago);
CREATE INDEX idx_facturas_fecha ON facturas(fecha_creacion DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (desarrollo)
-- ⚠️ En producción, configura políticas más restrictivas
CREATE POLICY "Permitir todas las operaciones en facturas" ON facturas
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

#### Obtener las credenciales:
1. En Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** (URL del proyecto)
   - **anon/public key** (Clave pública)

#### Configurar variables de entorno:
1. Copia el archivo `.env.example` a `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edita el archivo `.env` y reemplaza con tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-aqui
```

## 🚀 Ejecutar el proyecto

### Modo desarrollo:
```powershell
npm run dev
```

El proyecto se abrirá automáticamente en [http://localhost:3000](http://localhost:3000)

### Construir para producción:
```powershell
npm run build
```

### Previsualizar build de producción:
```powershell
npm run preview
```

## 📁 Estructura del Proyecto

```
TallerRivera/
├── src/
│   ├── components/          # Componentes React
│   │   ├── FormularioFactura.jsx   # Formulario de creación/edición
│   │   └── ListaFacturas.jsx       # Tabla de facturas
│   ├── services/            # Servicios de API
│   │   ├── supabase.js             # Cliente de Supabase
│   │   └── facturasService.js      # CRUD de facturas
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
└── .env                    # Variables de entorno (no incluir en git)
```

## 🔌 API de Supabase

### Endpoints disponibles (generados automáticamente):

El servicio `facturasService.js` proporciona los siguientes métodos:

- `obtenerFacturas()` - Obtener todas las facturas
- `obtenerFacturaPorId(id)` - Obtener una factura específica
- `crearFactura(factura)` - Crear nueva factura
- `actualizarFactura(id, datos)` - Actualizar factura existente
- `eliminarFactura(id)` - Eliminar factura
- `buscarPorNumero(numero)` - Buscar por número de factura
- `filtrarPorEstado(estado)` - Filtrar por estado de pago

### Ejemplo de uso:

```javascript
import { facturasService } from './services/facturasService'

// Crear factura
const nuevaFactura = await facturasService.crearFactura({
  numero_factura: 'FAC-001',
  precio_repuesto: 150.00,
  precio_servicio: 80.00,
  detalle: 'Cambio de aceite y filtros',
  estado_pago: 'pendiente'
})

// Obtener todas las facturas
const facturas = await facturasService.obtenerFacturas()

// Actualizar estado
await facturasService.actualizarFactura(id, {
  estado_pago: 'pagado'
})
```

## 📊 Esquema de la Base de Datos

### Tabla: `facturas`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único (auto-generado) |
| numero_factura | TEXT | Número de factura (único) |
| precio_repuesto | DECIMAL | Precio de repuestos |
| precio_servicio | DECIMAL | Precio del servicio |
| detalle | TEXT | Descripción del trabajo |
| estado_pago | TEXT | 'pagado' o 'pendiente' |
| fecha_creacion | TIMESTAMP | Fecha de creación (auto) |

## 🎨 Características de la Interfaz

- **Diseño Responsive**: Funciona en móviles, tablets y desktop
- **Formulario Inteligente**: Calcula automáticamente el total
- **Búsqueda en Tiempo Real**: Busca facturas por número
- **Filtros Rápidos**: Filtra por estado de pago
- **Edición In-Place**: Edita facturas con un clic
- **Confirmación de Eliminación**: Previene borrados accidentales

## 🔒 Seguridad

### Para desarrollo:
La configuración actual permite todas las operaciones (RLS habilitado con política permisiva).

### Para producción:
Se recomienda configurar políticas de seguridad más estrictas en Supabase:

```sql
-- Ejemplo: Requiere autenticación
DROP POLICY "Permitir todas las operaciones en facturas" ON facturas;

CREATE POLICY "Los usuarios autenticados pueden ver facturas" ON facturas
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios autenticados pueden insertar facturas" ON facturas
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

## 📝 Próximas Mejoras Sugeridas

- [ ] Sistema de autenticación de usuarios
- [ ] Reportes en PDF
- [ ] Dashboard con estadísticas
- [ ] Gestión de clientes
- [ ] Historial de vehículos
- [ ] Envío de facturas por email
- [ ] Modo oscuro

## 🆘 Solución de Problemas

### Error: "Faltan las credenciales de Supabase"
- Verifica que el archivo `.env` exista y tenga las credenciales correctas
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo después de editar `.env`

### Error al conectar con Supabase
- Verifica que la URL y la clave sean correctas
- Comprueba que la tabla `facturas` exista en tu base de datos
- Revisa que RLS esté configurado correctamente

### La página no carga
- Verifica que las dependencias estén instaladas: `npm install`
- Comprueba que el puerto 3000 no esté en uso
- Revisa la consola del navegador para errores

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ para Taller Rivera
