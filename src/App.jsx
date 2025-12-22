import { useState, useEffect } from 'react'
import FormularioFactura from './components/FormularioFactura'
import Dashboard from './components/Dashboard'
import VerFacturas from './components/VerFacturas'
import Login from './components/Login'
import Toast from './components/Toast'
import { facturasService } from './services/facturasService'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { useToast } from './hooks/useToast'

function App() {
  const { user, cargando: cargandoAuth, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [facturaEditando, setFacturaEditando] = useState(null)
  const { toasts, hideToast, success, error: showError, warning } = useToast()

  const handleGuardarFactura = async (factura) => {
    try {
      if (facturaEditando) {
        await facturasService.actualizarFactura(facturaEditando.id, factura)
        setFacturaEditando(null)
        setVistaActual('ver-facturas')
        // Mostrar notificación después del cambio de vista
        setTimeout(() => success('Factura actualizada exitosamente'), 100)
      } else {
        await facturasService.crearFactura(factura)
        setFacturaEditando(null)
        setVistaActual('ver-facturas')
        // Mostrar notificación después del cambio de vista
        setTimeout(() => success('Factura creada exitosamente'), 100)
      }
    } catch (err) {
      showError('❌ Error al guardar la factura: ' + err.message)
      console.error(err)
    }
  }

  const handleEditarFactura = (factura) => {
    setFacturaEditando(factura)
    setVistaActual('nueva-factura')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    success(`✏️ Editando factura de la placa: ${factura.placa}`)
  }

  const handleCancelarEdicion = () => {
    setFacturaEditando(null)
    setVistaActual('dashboard')
    warning('❌ Edición cancelada')
  }

  const handleNavigate = (vista) => {
    setVistaActual(vista)
    setFacturaEditando(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = (usuario) => {
    success('👋 Bienvenido al sistema')
  }

  const handleLogout = async () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      await logout()
    }
  }

  const handleToggleTheme = () => {
    toggleDarkMode()
  }

  // Mostrar pantalla de carga
  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar login si no hay usuario
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <div className="cursor-pointer" onClick={() => handleNavigate('dashboard')}>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔧 Taller Rivera
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Sistema de Gestión de Facturas</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrador</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                vistaActual === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigate('nueva-factura')}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                vistaActual === 'nueva-factura'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Nueva Factura
            </button>
            <button
              onClick={() => handleNavigate('ver-facturas')}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                vistaActual === 'ver-facturas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Ver Facturas
            </button>
          </div>
        </div>

        {/* Contenido dinámico según vista actual */}
        <div className="px-4">
          {vistaActual === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}

          {vistaActual === 'nueva-factura' && (
            <FormularioFactura
              onGuardar={handleGuardarFactura}
              facturaEditando={facturaEditando}
              onCancelar={handleCancelarEdicion}
            />
          )}

          {vistaActual === 'ver-facturas' && (
            <VerFacturas onEditar={handleEditarFactura} />
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default App
