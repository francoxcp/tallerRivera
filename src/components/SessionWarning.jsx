import { useAuth } from '../context/AuthContext';

export default function SessionWarning() {
  const { mostrarAdvertencia, minutosRestantes, extenderSesion, logout } = useAuth();

  if (!mostrarAdvertencia) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {/* Ícono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="text-yellow-500 text-5xl">⏰</div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Sesión por Expirar
        </h2>

        {/* Mensaje */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Tu sesión expirará en <span className="font-bold text-red-600">{minutosRestantes} minutos</span> por inactividad.
        </p>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(minutosRestantes / 2) * 100}%` }}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          {/* Botón de cerrar sesión */}
          <button
            onClick={logout}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Cerrar Sesión
          </button>

          {/* Botón de continuar */}
          <button
            onClick={extenderSesion}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Continuar
          </button>
        </div>

        {/* Advertencia adicional */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          La sesión se cerrará automáticamente si no realizas actividad
        </p>
      </div>
    </div>
  );
}
