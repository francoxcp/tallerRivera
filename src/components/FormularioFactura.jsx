import { useState, useEffect } from 'react'

function FormularioFactura({ onGuardar, facturaEditando, onCancelar }) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_cedula: '',
    vehiculo: '',
    placa: '',
    estado_pago: 'pendiente',
    fecha_entrada: '',
    fecha_salida: '',
    observaciones: ''
  })

  const [servicios, setServicios] = useState([])
  const [repuestos, setRepuestos] = useState([])

  useEffect(() => {
    if (facturaEditando) {
      setFormData({
        cliente_nombre: facturaEditando.cliente_nombre || '',
        cliente_cedula: facturaEditando.cliente_cedula || '',
        vehiculo: facturaEditando.vehiculo || '',
        placa: facturaEditando.placa || '',
        estado_pago: facturaEditando.estado_pago || 'pendiente',
        fecha_entrada: facturaEditando.fecha_entrada || '',
        fecha_salida: facturaEditando.fecha_salida || '',
        observaciones: facturaEditando.observaciones || ''
      })
      setServicios(facturaEditando.factura_servicios || [])
      setRepuestos(facturaEditando.factura_repuestos || [])
    }
  }, [facturaEditando])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const datosParaEnviar = {
      ...formData,
      servicios: servicios.map(s => ({
        descripcion: s.descripcion,
        precio: parseFloat(s.precio) || 0,
        cantidad: parseInt(s.cantidad) || 1
      })),
      repuestos: repuestos.map(r => ({
        nombre: r.nombre,
        precio_unitario: parseFloat(r.precio_unitario) || 0,
        cantidad: parseInt(r.cantidad) || 1
      }))
    }
    
    onGuardar(datosParaEnviar)
    limpiarFormulario()
  }

  const limpiarFormulario = () => {
    setFormData({
      cliente_nombre: '',
      cliente_cedula: '',
      vehiculo: '',
      placa: '',
      estado_pago: 'pendiente',
      fecha_entrada: '',
      fecha_salida: '',
      observaciones: ''
    })
    setServicios([])
    setRepuestos([])
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

  const agregarServicio = (descripcion, precio, cantidad) => {
    if (descripcion && precio) {
      setServicios([...servicios, { descripcion, precio, cantidad }])
    }
  }

  const eliminarServicio = (index) => {
    setServicios(servicios.filter((_, i) => i !== index))
  }

  const agregarRepuesto = (nombre, precio_unitario, cantidad, numero_factura) => {
    if (nombre && precio_unitario) {
      setRepuestos([...repuestos, { nombre, precio_unitario, cantidad, numero_factura }])
    }
  }

  const eliminarRepuesto = (index) => {
    setRepuestos(repuestos.filter((_, i) => i !== index))
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  const totalServicios = servicios.reduce((sum, s) => sum + (parseFloat(s.precio) * parseInt(s.cantidad)), 0)
  const totalRepuestos = repuestos.reduce((sum, r) => sum + (parseFloat(r.precio_unitario) * parseInt(r.cantidad)), 0)
  const totalGeneral = totalServicios + totalRepuestos

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {facturaEditando ? 'Editar Factura' : 'Nueva Factura'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Datos de la Factura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-1">
                Placa del Vehículo *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                placeholder="ABC-123"
                maxLength="20"
              />
            </div>

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

            <div>
              <label htmlFor="fecha_entrada" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Entrada
              </label>
              <input
                type="date"
                id="fecha_entrada"
                name="fecha_entrada"
                value={formData.fecha_entrada}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="fecha_salida" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Salida
              </label>
              <input
                type="date"
                id="fecha_salida"
                name="fecha_salida"
                value={formData.fecha_salida}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cliente_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="cliente_nombre"
                name="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Juan Pérez González"
              />
            </div>

            <div>
              <label htmlFor="cliente_cedula" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cédula *
              </label>
              <input
                type="text"
                id="cliente_cedula"
                name="cliente_cedula"
                value={formData.cliente_cedula}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1-1234-5678"
                maxLength="50"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Datos del Vehículo</h3>
          <div>
            <label htmlFor="vehiculo" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Vehículo
            </label>
            <input
              type="text"
              id="vehiculo"
              name="vehiculo"
              value={formData.vehiculo}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Toyota Corolla 2015 Gris"
            />
          </div>
        </div>

        <div className="border-b pb-4">
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-900 mb-1">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Detalles adicionales sobre el trabajo..."
          />
        </div>

        <ServiciosSection 
          servicios={servicios}
          onAgregar={agregarServicio}
          onEliminar={eliminarServicio}
          formatearMoneda={formatearMoneda}
        />

        <RepuestosSection
          repuestos={repuestos}
          onAgregar={agregarRepuesto}
          onEliminar={eliminarRepuesto}
          formatearMoneda={formatearMoneda}
        />

        {totalGeneral > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>TOTAL GENERAL:</span>
              <span className="text-2xl text-blue-600">₡{formatearMoneda(totalGeneral)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <div className="flex justify-between">
                <span>Servicios:</span>
                <span>₡{formatearMoneda(totalServicios)}</span>
              </div>
              <div className="flex justify-between">
                <span>Repuestos:</span>
                <span>₡{formatearMoneda(totalRepuestos)}</span>
              </div>
            </div>
          </div>
        )}

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
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function ServiciosSection({ servicios, onAgregar, onEliminar, formatearMoneda }) {
  const [nuevo, setNuevo] = useState({ descripcion: '', precio: '', cantidad: 1 })

  const handleAgregar = () => {
    if (nuevo.descripcion && nuevo.precio) {
      onAgregar(nuevo.descripcion, nuevo.precio, nuevo.cantidad)
      setNuevo({ descripcion: '', precio: '', cantidad: 1 })
    }
  }

  const total = servicios.reduce((sum, s) => sum + (parseFloat(s.precio) * parseInt(s.cantidad)), 0)

  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Servicios Realizados</h3>
      
      {servicios.length > 0 && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Descripción</th>
                <th className="text-right py-2">Precio</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2">{servicio.descripcion}</td>
                  <td className="text-right">₡{formatearMoneda(parseFloat(servicio.precio))}</td>
                  <td className="text-center">{servicio.cantidad}</td>
                  <td className="text-right">₡{formatearMoneda(parseFloat(servicio.precio) * parseInt(servicio.cantidad))}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => onEliminar(index)}
                      className="text-red-600 hover:text-red-800 text-lg"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan="3" className="text-right py-2">Total Servicios:</td>
                <td className="text-right">₡{formatearMoneda(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-5">
          <input
            type="text"
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({...nuevo, descripcion: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Descripción del servicio"
          />
        </div>
        <div className="md:col-span-3">
          <input
            type="number"
            value={nuevo.precio}
            onChange={(e) => setNuevo({...nuevo, precio: e.target.value})}
            step="0.01"
            min="0"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Precio"
          />
        </div>
        <div className="md:col-span-2">
          <input
            type="number"
            value={nuevo.cantidad}
            onChange={(e) => setNuevo({...nuevo, cantidad: e.target.value})}
            min="1"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Cant."
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleAgregar}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

function RepuestosSection({ repuestos, onAgregar, onEliminar, formatearMoneda }) {
  const [nuevo, setNuevo] = useState({ nombre: '', precio_unitario: '', cantidad: 1, numero_factura: '' })

  const handleAgregar = () => {
    if (nuevo.nombre && nuevo.precio_unitario) {
      onAgregar(nuevo.nombre, nuevo.precio_unitario, nuevo.cantidad, nuevo.numero_factura)
      setNuevo({ nombre: '', precio_unitario: '', cantidad: 1, numero_factura: '' })
    }
  }

  const total = repuestos.reduce((sum, r) => sum + (parseFloat(r.precio_unitario) * parseInt(r.cantidad)), 0)

  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Repuestos Utilizados</h3>
      
      {repuestos.length > 0 && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nombre</th>
                <th className="text-left py-2">N° Factura</th>
                <th className="text-right py-2">Precio Unit.</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {repuestos.map((repuesto, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2">{repuesto.nombre}</td>
                  <td className="py-2 text-gray-600">{repuesto.numero_factura || '-'}</td>
                  <td className="text-right">₡{formatearMoneda(parseFloat(repuesto.precio_unitario))}</td>
                  <td className="text-center">{repuesto.cantidad}</td>
                  <td className="text-right">₡{formatearMoneda(parseFloat(repuesto.precio_unitario) * parseInt(repuesto.cantidad))}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => onEliminar(index)}
                      className="text-red-600 hover:text-red-800 text-lg"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan="4" className="text-right py-2">Total Repuestos:</td>
                <td className="text-right">₡{formatearMoneda(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-4">
            <input
              type="text"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({...nuevo, nombre: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nombre del repuesto"
            />
          </div>
          <div className="md:col-span-3">
            <input
              type="text"
              value={nuevo.numero_factura}
              onChange={(e) => setNuevo({...nuevo, numero_factura: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="N° Factura (opcional)"
            />
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              value={nuevo.precio_unitario}
              onChange={(e) => setNuevo({...nuevo, precio_unitario: e.target.value})}
              step="0.01"
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Precio"
            />
          </div>
          <div className="md:col-span-1">
            <input
              type="number"
              value={nuevo.cantidad}
              onChange={(e) => setNuevo({...nuevo, cantidad: e.target.value})}
              min="1"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Cant."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleAgregar}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormularioFactura
