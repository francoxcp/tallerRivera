import { useState, useEffect } from 'react'
import { facturasService } from '../services/facturasService'

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalFacturas: 0,
    facturasPendientes: 0,
    facturasPagadas: 0,
    ingresosTotales: 0
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setCargando(true)
      const facturas = await facturasService.obtenerFacturas()
      
      let totalIngresos = 0
      let facturasPagadas = 0
      let facturasPendientes = 0
      
      facturas.forEach(factura => {
        const totales = facturasService.calcularTotales(factura)
        if (factura.estado_pago === 'pagado') {
          facturasPagadas++
          totalIngresos += totales.totalGeneral
        } else {
          facturasPendientes++
        }
      })
      
      setStats({
        totalFacturas: facturas.length,
        facturasPendientes,
        facturasPagadas,
        ingresosTotales: totalIngresos
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setCargando(false)
    }
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR').format(valor)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Taller Rivera</h1>
        <p className="mt-2 text-blue-100">Sistema de Gestión de Facturas</p>
      </div>

      {/* Tarjetas de estadísticas */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFacturas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.facturasPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.facturasPagadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white bg-opacity-30 rounded-full p-3">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 text-white">
                <p className="text-sm font-medium opacity-90">Ingresos Totales</p>
                <p className="text-3xl font-bold">₡{formatearMoneda(stats.ingresosTotales)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('nueva-factura')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition duration-200 text-left"
          >
            <div className="flex items-center">
              <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h4 className="text-xl font-semibold">Crear Nueva Factura</h4>
                <p className="text-blue-100 text-sm">Registrar un nuevo trabajo</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ver-facturas')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition duration-200 text-left"
          >
            <div className="flex items-center">
              <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h4 className="text-xl font-semibold">Ver Todas las Facturas</h4>
                <p className="text-green-100 text-sm">Consultar y gestionar facturas</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Gestión completa de facturas por vehículo (identificadas por placa)</p>
          <p>• Registro de servicios realizados y repuestos utilizados</p>
          <p>• Control de estado de pago (pendiente/pagado)</p>
          <p>• Búsqueda rápida por placa del vehículo</p>
          <p>• Cálculo automático de totales en colones costarricenses (₡)</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
