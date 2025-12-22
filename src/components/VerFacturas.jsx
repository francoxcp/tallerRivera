import { useState, useEffect } from 'react'
import ListaFacturas from './ListaFacturas'
import { facturasService } from '../services/facturasService'

function VerFacturas({ onEditar }) {
  const [facturas, setFacturas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarFacturas()
  }, [filtroEstado])

  const cargarFacturas = async () => {
    try {
      setCargando(true)
      setError(null)
      let datos
      
      if (filtroEstado === 'todas') {
        datos = await facturasService.obtenerFacturas()
      } else {
        datos = await facturasService.filtrarPorEstado(filtroEstado)
      }
      
      setFacturas(datos)
    } catch (err) {
      setError('Error al cargar las facturas: ' + err.message)
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleBuscar = async () => {
    if (busqueda.trim()) {
      try {
        setCargando(true)
        const datos = await facturasService.buscarPorPlaca(busqueda)
        setFacturas(datos)
      } catch (err) {
        setError('Error en la búsqueda: ' + err.message)
      } finally {
        setCargando(false)
      }
    } else {
      cargarFacturas()
    }
  }

  const handleEliminarFactura = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta factura?')) {
      try {
        await facturasService.eliminarFactura(id)
        await cargarFacturas()
      } catch (err) {
        setError('Error al eliminar la factura: ' + err.message)
        console.error(err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Todas las Facturas</h2>
        <p className="text-gray-600">Consulta y gestiona todas las facturas del taller</p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por placa del vehículo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                placeholder="Ej: ABC-123"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
              />
              <button
                onClick={handleBuscar}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Buscar
              </button>
              {busqueda && (
                <button
                  onClick={() => {
                    setBusqueda('')
                    cargarFacturas()
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="pagado">Pagadas</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de facturas */}
      <ListaFacturas
        facturas={facturas}
        onEditar={onEditar}
        onEliminar={handleEliminarFactura}
        cargando={cargando}
      />
    </div>
  )
}

export default VerFacturas
