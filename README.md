# 🔧 Taller Rivera - Sistema de Gestión de Facturas

Sistema web moderno para gestionar facturas de un taller mecánico con seguimiento individual de pagos.

## ✨ Características Principales

### 📋 Gestión de Facturas

- ✅ Creación de facturas con múltiples servicios y repuestos
- ✏️ Edición y eliminación de facturas existentes
- 🔍 Búsqueda por placa del vehículo
- 🎯 Filtrado por estado de pago (pagado/pendiente)
- 💰 Seguimiento individual de pago por servicio y repuesto
- 📊 Dashboard con estadísticas en tiempo real

### 🎨 Interfaz

- 🌙 Modo oscuro/claro
- 📱 Diseño responsive (móvil, tablet, desktop)
- 🔔 Notificaciones toast para todas las acciones
- ⚡ Interfaz rápida y moderna

### 🔒 Seguridad

- 🔐 Sistema de autenticación con Supabase Auth
- 🛡️ Row Level Security (RLS) en base de datos
- 🔑 Recuperación de contraseña por email

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite 5
- **Estilos**: TailwindCSS 3.4 con dark mode
- **Backend**: Supabase (PostgreSQL + Auth)
- **Despliegue**: Vercel

## 📦 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/francoxcp/tallerRivera.git
cd tallerRivera
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Configurar Base de Datos

Ejecuta los siguientes scripts SQL en orden desde el SQL Editor de Supabase:

1. **`supabase-setup.sql`** - Crea las tablas principales
2. **`supabase-clientes-setup.sql`** - Agrega campos de cliente
3. **`supabase-add-pagado-column.sql`** - Agrega seguimiento de pago individual

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
TallerRivera/
├── src/
│   ├── components/         # Componentes React
│   │   ├── Dashboard.jsx
│   │   ├── FormularioFactura.jsx
│   │   ├── ListaFacturas.jsx
│   │   ├── VerFacturas.jsx
│   │   ├── Login.jsx
│   │   └── Toast.jsx
│   ├── context/           # Context API
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/             # Custom hooks
│   │   └── useToast.js
│   ├── services/          # Servicios API
│   │   ├── supabase.js
│   │   ├── facturasService.js
│   │   └── authService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── sql/
│   ├── supabase-setup.sql              # Setup inicial
│   ├── supabase-clientes-setup.sql     # Campos de cliente
│   └── supabase-add-pagado-column.sql  # Seguimiento de pago
├── DEPLOY-GUIDE.md                 # Guía de despliegue
├── GUIA-LOGIN.md                   # Guía de autenticación
├── MIGRACION-PAGADO.md            # Guía de migración
└── README.md
```

## 🚀 Despliegue

Ver [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md) para instrucciones detalladas de despliegue en Vercel.

## 📖 Documentación Adicional

- **[GUIA-LOGIN.md](./GUIA-LOGIN.md)** - Configuración del sistema de autenticación
- **[MIGRACION-PAGADO.md](./MIGRACION-PAGADO.md)** - Migración para seguimiento de pagos
- **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** - Guía completa de despliegue

## 🔑 Credenciales de Demo

Ver `CREDENCIALES-ADMIN.md` (archivo local, no versionado)

## 💡 Uso

### Crear una Factura

1. Click en "Nueva Factura"
2. Completa los datos del cliente y vehículo
3. Agrega servicios y repuestos
4. Marca los items pagados con el checkbox
5. Guarda la factura

### Editar una Factura

1. Ve a "Ver Facturas"
2. Click en "Editar" en la factura deseada
3. Modifica los datos necesarios
4. Marca/desmarca items como pagados
5. Guarda los cambios

### Búsqueda y Filtros

- Busca por placa del vehículo
- Filtra por estado: Todas / Pagadas / Pendientes
- Ve estadísticas en el Dashboard

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Francisco** - [francoxcp](https://github.com/francoxcp)

## 🐛 Reportar Problemas

Si encuentras algún bug o tienes sugerencias, por favor abre un [issue](https://github.com/francoxcp/tallerRivera/issues).
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
