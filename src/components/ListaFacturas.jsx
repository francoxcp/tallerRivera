import { facturasService } from '../services/facturasService'

function ListaFacturas({ facturas, onEditar, onEliminar, cargando }) {
  if (cargando) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Cargando facturas...</p>
      </div>
    )
  }

  if (facturas.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva factura.</p>
      </div>
    )
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Lista de Facturas ({facturas.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {facturas.map((factura) => {
          const totales = facturasService.calcularTotales(factura)
          
          return (
            <div key={factura.id} className="p-6 hover:bg-gray-50">
              {/* Header de la factura */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    🚗 {factura.placa}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    {factura.cliente_nombre && <p><strong>Cliente:</strong> {factura.cliente_nombre}</p>}
                    {factura.cliente_cedula && <p><strong>Cédula:</strong> {factura.cliente_cedula}</p>}
                    {factura.vehiculo && <p><strong>Vehículo:</strong> {factura.vehiculo}</p>}
                    <p className="text-xs text-gray-500">
                      {factura.fecha_creacion ? formatearFecha(factura.fecha_creacion) : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    factura.estado_pago === 'pagado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {factura.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ₡{formatearMoneda(totales.totalGeneral)}
                    </p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              {factura.factura_servicios && factura.factura_servicios.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Servicios:</h5>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <ul className="space-y-1 text-sm">
                      {factura.factura_servicios.map((servicio, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>
                            {servicio.descripcion} 
                            {servicio.cantidad > 1 && <span className="text-gray-600"> (x{servicio.cantidad})</span>}
                          </span>
                          <span className="font-semibold">
                            ₡{formatearMoneda(servicio.precio * servicio.cantidad)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
                      <span>Subtotal Servicios:</span>
                      <span>₡{formatearMoneda(totales.totalServicios)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Repuestos */}
              {factura.factura_repuestos && factura.factura_repuestos.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Repuestos:</h5>
                  <div className="bg-green-50 rounded-lg p-3">
                    <ul className="space-y-1 text-sm">
                      {factura.factura_repuestos.map((repuesto, idx) => (
                        <li key={idx} className="flex justify-between items-start">
                          <span className="flex-1">
                            {repuesto.nombre}
                            {repuesto.cantidad > 1 && <span className="text-gray-600"> (x{repuesto.cantidad})</span>}
                            {repuesto.numero_factura && (
                              <span className="block text-xs text-gray-500 mt-0.5">
                                Factura: {repuesto.numero_factura}
                              </span>
                            )}
                          </span>
                          <span className="font-semibold ml-2">
                            ₡{formatearMoneda(repuesto.precio_unitario * repuesto.cantidad)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-green-200 mt-2 pt-2 flex justify-between font-semibold">
                      <span>Subtotal Repuestos:</span>
                      <span>₡{formatearMoneda(totales.totalRepuestos)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {factura.observaciones && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Observaciones:</strong> {factura.observaciones}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => onEditar(factura)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => onEliminar(factura.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ListaFacturas
