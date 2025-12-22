import { useState, useEffect } from 'react'

function FormularioFactura({ onGuardar, facturaEditando, onCancelar }) {
  const [formData, setFormData] = useState({
    numero_factura: '',
    precio_repuesto: '',
    precio_servicio: '',
    detalle: '',
    estado_pago: 'pendiente'
  })

  useEffect(() => {
    if (facturaEditando) {
      setFormData({
        numero_factura: facturaEditando.numero_factura || '',
        precio_repuesto: facturaEditando.precio_repuesto || '',
        precio_servicio: facturaEditando.precio_servicio || '',
        detalle: facturaEditando.detalle || '',
        estado_pago: facturaEditando.estado_pago || 'pendiente'
      })
    }
  }, [facturaEditando])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const datosParaEnviar = {
      ...formData,
      precio_repuesto: parseFloat(formData.precio_repuesto) || 0,
      precio_servicio: parseFloat(formData.precio_servicio) || 0
    }
    
    onGuardar(datosParaEnviar)
    limpiarFormulario()
  }

  const limpiarFormulario = () => {
    setFormData({
      numero_factura: '',
      precio_repuesto: '',
      precio_servicio: '',
      detalle: '',
      estado_pago: 'pendiente'
    })
  }

  const handleCancelar = () => {
    limpiarFormulario()
    onCancelar()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const total = (parseFloat(formData.precio_repuesto) || 0) + (parseFloat(formData.precio_servicio) || 0)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {facturaEditando ? 'Editar Factura' : 'Nueva Factura'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Factura */}
          <div>
            <label htmlFor="numero_factura" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Factura *
            </label>
            <input
              type="text"
              id="numero_factura"
              name="numero_factura"
              value={formData.numero_factura}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: FAC-001"
            />
          </div>

          {/* Estado de Pago */}
          <div>
            <label htmlFor="estado_pago" className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Pago *
            </label>
            <select
              id="estado_pago"
              name="estado_pago"
              value={formData.estado_pago}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>

          {/* Precio Repuesto */}
          <div>
            <label htmlFor="precio_repuesto" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Repuesto
            </label>
            <input
              type="number"
              id="precio_repuesto"
              name="precio_repuesto"
              value={formData.precio_repuesto}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Precio Servicio */}
          <div>
            <label htmlFor="precio_servicio" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Servicio
            </label>
            <input
              type="number"
              id="precio_servicio"
              name="precio_servicio"
              value={formData.precio_servicio}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Detalle */}
        <div>
          <label htmlFor="detalle" className="block text-sm font-medium text-gray-700 mb-1">
            Detalle del Trabajo
          </label>
          <textarea
            id="detalle"
            name="detalle"
            value={formData.detalle}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe el trabajo realizado en el vehículo..."
          />
        </div>

        {/* Total */}
        {total > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-lg font-semibold text-gray-900">
              Total: ${total.toFixed(2)}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {facturaEditando ? 'Actualizar' : 'Guardar'} Factura
          </button>
          
          {facturaEditando && (
            <button
              type="button"
              onClick={handleCancelar}
              className="px-6 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default FormularioFactura
