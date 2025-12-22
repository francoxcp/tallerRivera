import { useState, useEffect } from 'react'

export default function FormularioCliente({ onGuardar, clienteEditando, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  })

  useEffect(() => {
    if (clienteEditando) {
      setFormData({
        nombre: clienteEditando.nombre || '',
        telefono: clienteEditando.telefono || '',
        email: clienteEditando.email || '',
        direccion: clienteEditando.direccion || '',
        notas: clienteEditando.notas || ''
      })
    }
  }, [clienteEditando])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(formData)
    limpiarFormulario()
  }

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      notas: ''
    })
  }

  const handleCancelar = () => {
    limpiarFormulario()
    if (onCancelar) onCancelar()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {clienteEditando ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
        </h2>
        {clienteEditando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre - Campo Requerido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Juan Pérez Rodríguez"
          />
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 8888-8888"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: cliente@email.com"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: San José, Barrio Escalante, 100m norte del parque"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Información adicional sobre el cliente..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
          >
            {clienteEditando ? '💾 Actualizar Cliente' : '➕ Guardar Cliente'}
          </button>
          
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition duration-200"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}
