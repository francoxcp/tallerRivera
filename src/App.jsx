import { useState, useEffect } from 'react'
import FormularioFactura from './components/FormularioFactura'
import Dashboard from './components/Dashboard'
import VerFacturas from './components/VerFacturas'
import Login from './components/Login'
import { facturasService } from './services/facturasService'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, cargando: cargandoAuth, logout } = useAuth()
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [facturaEditando, setFacturaEditando] = useState(null)
  const [error, setError] = useState(null)

  const handleGuardarFactura = async (factura) => {
    try {
      if (facturaEditando) {
        await facturasService.actualizarFactura(facturaEditando.id, factura)
      } else {
        await facturasService.crearFactura(factura)
      }
      
      setFacturaEditando(null)
      setVistaActual('ver-facturas')
    } catch (err) {
      setError('Error al guardar la factura: ' + err.message)
      console.error(err)
    }
  }

  const handleEditarFactura = (factura) => {
    setFacturaEditando(factura)
    setVistaActual('nueva-factura')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelarEdicion = () => {
    setFacturaEditando(null)
    setVistaActual('dashboard')
  }

  const handleNavigate = (vista) => {
    setVistaActual(vista)
    setFacturaEditando(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = (usuario) => {
    // El AuthContext se actualiza automáticamente
  }

  const handleLogout = async () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      await logout()
    }
  }

  // Mostrar pantalla de carga
  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar login si no hay usuario
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <div className="cursor-pointer" onClick={() => handleNavigate('dashboard')}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔧 Taller Rivera
              </h1>
              <p className="text-gray-600">Sistema de Gestión de Facturas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Administrador</p>
                <p className="text-xs text-gray-500">{user.email}</p>
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
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigate('nueva-factura')}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                vistaActual === 'nueva-factura'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nueva Factura
            </button>
            <button
              onClick={() => handleNavigate('ver-facturas')}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                vistaActual === 'ver-facturas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ver Facturas
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mx-4 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

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
    </div>
  )
}

export default App
