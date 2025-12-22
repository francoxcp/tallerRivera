import { useState } from 'react'
import { iniciarSesion, recuperarContrasena } from '../services/authService'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    setCargando(true)

    const { data, error } = await iniciarSesion(email, password)

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setCargando(false)
      return
    }

    if (data?.user) {
      onLoginSuccess(data.user)
    }
    
    setCargando(false)
  }

  const handleRecuperacion = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    
    if (!email) {
      setError('Por favor ingresa tu email para recuperar la contraseña')
      return
    }

    setCargando(true)
    const { error } = await recuperarContrasena(email)

    if (error) {
      setError('Error al enviar el correo de recuperación. Intenta nuevamente.')
    } else {
      setMensaje('✅ Correo enviado. IMPORTANTE: Revisa tu bandeja de entrada Y la carpeta de SPAM. El correo puede tardar hasta 5 minutos. Si no lo recibes, contacta al administrador del sistema.')
      setMostrarRecuperacion(false)
    }
    
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Taller Rivera</h1>
          <p className="text-gray-600">Sistema de Gestión de Facturas</p>
        </div>

        {!mostrarRecuperacion ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@tallerrivera.com"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMostrarRecuperacion(true)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecuperacion} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recuperar Contraseña</h2>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@tallerrivera.com"
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Enviando...' : 'Enviar Correo de Recuperación'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarRecuperacion(false)
                  setError('')
                  setMensaje('')
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Volver al Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sistema protegido - Acceso solo para administradores
          </p>
        </div>
      </div>
    </div>
  )
}
