import { useState, useEffect } from 'react'
import { clientesService } from '../services/clientesService'

export default function ListaClientes({ onEditar, onSeleccionar }) {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [clienteConHistorial, setClienteConHistorial] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      setCargando(true)
      const datos = await clientesService.obtenerClientes()
      setClientes(datos)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleBuscar = async () => {
    if (busqueda.trim()) {
      try {
        setCargando(true)
        const datos = await clientesService.buscarClientes(busqueda)
        setClientes(datos)
      } catch (error) {
        console.error('Error en búsqueda:', error)
      } finally {
        setCargando(false)
      }
    } else {
      cargarClientes()
    }
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientesService.eliminarCliente(id)
        await cargarClientes()
      } catch (error) {
        console.error('Error al eliminar cliente:', error)
        alert('Error al eliminar el cliente. Puede tener facturas asociadas.')
      }
    }
  }

  const verHistorial = async (cliente) => {
    try {
      setCargando(true)
      const stats = await clientesService.obtenerEstadisticasCliente(cliente.id)
      setEstadisticas(stats)
      setClienteConHistorial(cliente)
    } catch (error) {
      console.error('Error al cargar historial:', error)
    } finally {
      setCargando(false)
    }
  }

  const cerrarHistorial = () => {
    setClienteConHistorial(null)
    setEstadisticas(null)
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            placeholder="Buscar por nombre, teléfono o email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleBuscar}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
          {busqueda && (
            <button
              onClick={() => {
                setBusqueda('')
                cargarClientes()
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Clientes Registrados ({clientes.length})
          </h3>
        </div>

        {clientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No hay clientes registrados</p>
            <p className="text-sm mt-2">Agrega tu primer cliente usando el formulario arriba</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="p-6 hover:bg-gray-50 transition duration-150">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      👤 {cliente.nombre}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {cliente.telefono && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📞 Teléfono:</span>
                          <span>{cliente.telefono}</span>
                        </div>
                      )}
                      
                      {cliente.email && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📧 Email:</span>
                          <span>{cliente.email}</span>
                        </div>
                      )}
                      
                      {cliente.direccion && (
                        <div className="flex items-start gap-2 md:col-span-2">
                          <span className="font-medium">📍 Dirección:</span>
                          <span>{cliente.direccion}</span>
                        </div>
                      )}
                      
                      {cliente.notas && (
                        <div className="flex items-start gap-2 md:col-span-2">
                          <span className="font-medium">📝 Notas:</span>
                          <span className="text-gray-500 italic">{cliente.notas}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {onSeleccionar && (
                      <button
                        onClick={() => onSeleccionar(cliente)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                      >
                        Seleccionar
                      </button>
                    )}
                    
                    <button
                      onClick={() => verHistorial(cliente)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition duration-200"
                    >
                      Historial
                    </button>
                    
                    <button
                      onClick={() => onEditar(cliente)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleEliminar(cliente.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Historial */}
      {clienteConHistorial && estadisticas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">
                Historial de {clienteConHistorial.nombre}
              </h3>
              <button
                onClick={cerrarHistorial}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.totalFacturas}</p>
                  <p className="text-sm text-gray-600">Facturas</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">₡{formatearMoneda(estadisticas.totalGastado)}</p>
                  <p className="text-sm text-gray-600">Total Gastado</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.facturasPendientes}</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{estadisticas.facturasPagadas}</p>
                  <p className="text-sm text-gray-600">Pagadas</p>
                </div>
              </div>

              {/* Última visita */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Última visita</p>
                <p className="text-lg font-semibold text-gray-900">{formatearFecha(estadisticas.ultimaVisita)}</p>
              </div>

              {/* Información de contacto */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Información de Contacto</h4>
                {clienteConHistorial.telefono && (
                  <p className="text-gray-600">📞 {clienteConHistorial.telefono}</p>
                )}
                {clienteConHistorial.email && (
                  <p className="text-gray-600">📧 {clienteConHistorial.email}</p>
                )}
                {clienteConHistorial.direccion && (
                  <p className="text-gray-600">📍 {clienteConHistorial.direccion}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={cerrarHistorial}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
