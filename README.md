# Taller Rivera - Sistema de Gestión de Facturas

Aplicación web de gestión de facturas para talleres mecánicos con autenticación segura, CRUD completo y dashboard en tiempo real.

## Características

- **CRUD de Facturas**: Crear, editar, eliminar y visualizar facturas
- **Búsqueda y Filtrado**: Por placa de vehículo y estado de pago
- **Seguimiento de Pagos**: Control individual por servicio/repuesto
- **Dashboard**: Estadísticas en tiempo real
- **Autenticación**: Sistema seguro con correo y contraseña
- **Tema Oscuro/Claro**: Interfaz adaptable
- **Responsive**: Optimizado para móvil, tablet y desktop

## Tech Stack

- **Frontend**: React 18, Vite 5, TailwindCSS 3.4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Seguridad**: Row Level Security (RLS)
- **Deployment**: Vercel

## Inicio Rápido

```bash
git clone https://github.com/francoxcp/tallerRivera.git
cd tallerRivera
npm install
npm run dev
```

## Características Técnicas

- **Context API** para manejo de estado global (Autenticación y Tema)
- **Custom Hooks** para lógica reutilizable (notificaciones toast)
- **Servicios desacoplados** para API calls (Supabase Auth y Facturas)
- **RLS (Row Level Security)** para seguridad a nivel de base de datos
- **Dark Mode** integrado con TailwindCSS

## Autor

Franco - [GitHub](https://github.com/francoxcp)
