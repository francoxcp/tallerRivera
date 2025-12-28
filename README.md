# Taller Rivera - Sistema de Gestión de Facturas

Aplicación web de gestión de facturas para talleres mecánicos con autenticación segura, CRUD completo y dashboard en tiempo real.

## ✨ Características

- **CRUD de Facturas**: Crear, editar, eliminar y visualizar facturas
- **Búsqueda y Filtrado**: Por placa de vehículo y estado de pago
- **Seguimiento de Pagos**: Control individual por servicio/repuesto
- **Dashboard**: Estadísticas en tiempo real
- **Autenticación**: Sistema seguro con correo y contraseña
- **Tema Oscuro/Claro**: Interfaz adaptable
- **Responsive**: Optimizado para móvil, tablet y desktop

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, TailwindCSS 3.4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Seguridad**: Row Level Security (RLS), JWT, Session Timeout
- **Deployment**: Vercel

## 🔒 Seguridad

✅ **RLS (Row Level Security)** - Cada usuario ve solo sus facturas  
✅ **Session Timeout** - Logout automático después de 30 minutos  
✅ **Input Validation** - Protección contra XSS e inyecciones  
✅ **Rate Limiting** - Previene spam y ataques de fuerza bruta  
✅ **HTTPS Obligatorio** - Encriptación en tránsito  
✅ **Content Security Policy** - Headers de seguridad avanzada  


```## 👨‍💻 Autor

Franco - [GitHub](https://github.com/francoxcp)
