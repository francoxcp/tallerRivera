import { useState, useEffect } from 'react';

function FormularioFactura({ onGuardar, facturaEditando, onCancelar }) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_cedula: '',
    vehiculo: '',
    placa: '',
    estado_pago: 'pendiente',
    fecha_entrada: '',
    fecha_salida: '',
    observaciones: '',
  });

  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);

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
        observaciones: facturaEditando.observaciones || '',
      });
      // Asegurar que servicios y repuestos tengan el campo 'pagado'
      setServicios(
        (facturaEditando.factura_servicios || []).map((s) => ({
          ...s,
          pagado: s.pagado !== undefined ? s.pagado : false,
        }))
      );
      setRepuestos(
        (facturaEditando.factura_repuestos || []).map((r) => ({
          ...r,
          pagado: r.pagado !== undefined ? r.pagado : false,
        }))
      );
    }
  }, [facturaEditando]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calcular estado_pago automáticamente
    const todosLosItems = [...servicios, ...repuestos];
    const todosPagados =
      todosLosItems.length > 0 && todosLosItems.every((item) => item.pagado === true);
    const estadoPagoCalculado = todosPagados ? 'pagado' : 'pendiente';

    // Si la factura está completamente pagada, cerramos el crédito (fecha_salida = hoy).
    // Si no, mantenemos fecha_salida en null para indicar que el crédito sigue abierto.
    const fechaSalidaCalculada =
      estadoPagoCalculado === 'pagado'
        ? formData.fecha_salida || new Date().toISOString().slice(0, 10)
        : null;

    const datosParaEnviar = {
      ...formData,
      estado_pago: estadoPagoCalculado,
      fecha_salida: fechaSalidaCalculada,
      servicios: servicios.map((s) => ({
        descripcion: s.descripcion,
        precio: parseFloat(s.precio) || 0,
        cantidad: parseInt(s.cantidad) || 1,
        pagado: s.pagado || false,
      })),
      repuestos: repuestos.map((r) => ({
        nombre: r.nombre,
        precio_unitario: parseFloat(r.precio_unitario) || 0,
        cantidad: parseInt(r.cantidad) || 1,
        numero_factura: r.numero_factura || null,
        pagado: r.pagado || false,
      })),
    };

    onGuardar(datosParaEnviar);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      cliente_nombre: '',
      cliente_cedula: '',
      vehiculo: '',
      placa: '',
      estado_pago: 'pendiente',
      fecha_entrada: '',
      fecha_salida: '',
      observaciones: '',
    });
    setServicios([]);
    setRepuestos([]);
  };

  const handleCancelar = () => {
    limpiarFormulario();
    onCancelar();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarServicio = (descripcion, precio, cantidad, pagado) => {
    if (descripcion && precio) {
      setServicios([...servicios, { descripcion, precio, cantidad, pagado }]);
    }
  };

  const actualizarPagadoServicio = (index, pagado) => {
    const nuevosServicios = [...servicios];
    nuevosServicios[index] = { ...nuevosServicios[index], pagado };
    setServicios(nuevosServicios);
  };

  const eliminarServicio = (index) => {
    setServicios(servicios.filter((_, i) => i !== index));
  };

  const agregarRepuesto = (nombre, precio_unitario, cantidad, numero_factura, pagado) => {
    if (nombre && precio_unitario) {
      setRepuestos([...repuestos, { nombre, precio_unitario, cantidad, numero_factura, pagado }]);
    }
  };

  const actualizarPagadoRepuesto = (index, pagado) => {
    const nuevosRepuestos = [...repuestos];
    nuevosRepuestos[index] = { ...nuevosRepuestos[index], pagado };
    setRepuestos(nuevosRepuestos);
  };

  const eliminarRepuesto = (index) => {
    setRepuestos(repuestos.filter((_, i) => i !== index));
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const formatDate = (d) => {
    if (!d) return 'Crédito abierto';
    try {
      return new Date(d).toLocaleDateString('es-CR');
    } catch (e) {
      return d;
    }
  };

  const totalServicios = servicios.reduce(
    (sum, s) => sum + parseFloat(s.precio) * parseInt(s.cantidad),
    0
  );
  const totalRepuestos = repuestos.reduce(
    (sum, r) => sum + parseFloat(r.precio_unitario) * parseInt(r.cantidad),
    0
  );
  const totalGeneral = totalServicios + totalRepuestos;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {facturaEditando ? 'Editar Factura' : 'Nueva Factura'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b dark:border-gray-700 pb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Datos de la Factura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="placa"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Placa del Vehículo *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                placeholder="ABC-123"
                maxLength="20"
              />
            </div>

            <div className="md:col-span-2 mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de cierre de crédito
              </label>
              <input
                type="text"
                readOnly
                value={
                  formData.fecha_salida ? formatDate(formData.fecha_salida) : 'Crédito abierto'
                }
                className="w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="fecha_entrada"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Fecha de Crédito
              </label>
              <input
                type="date"
                id="fecha_entrada"
                name="fecha_entrada"
                value={formData.fecha_entrada}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b dark:border-gray-700 pb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Datos del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cliente_nombre"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nombre Completo *
              </label>
              <input
                type="text"
                id="cliente_nombre"
                name="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Juan Pérez González"
              />
            </div>

            <div>
              <label
                htmlFor="cliente_cedula"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Número de Cédula *
              </label>
              <input
                type="text"
                id="cliente_cedula"
                name="cliente_cedula"
                value={formData.cliente_cedula}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1-1234-5678"
                maxLength="50"
              />
            </div>
          </div>
        </div>

        <div className="border-b dark:border-gray-700 pb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Datos del Vehículo
          </h3>
          <div>
            <label
              htmlFor="vehiculo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Descripción del Vehículo
            </label>
            <input
              type="text"
              id="vehiculo"
              name="vehiculo"
              value={formData.vehiculo}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Toyota Corolla 2015 Gris"
            />
          </div>
        </div>

        <div className="border-b dark:border-gray-700 pb-4">
          <label
            htmlFor="observaciones"
            className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
          >
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Detalles adicionales sobre el trabajo..."
          />
        </div>

        <ServiciosSection
          servicios={servicios}
          onAgregar={agregarServicio}
          onEliminar={eliminarServicio}
          onActualizarPagado={actualizarPagadoServicio}
          formatearMoneda={formatearMoneda}
        />

        <RepuestosSection
          repuestos={repuestos}
          onAgregar={agregarRepuesto}
          onEliminar={eliminarRepuesto}
          onActualizarPagado={actualizarPagadoRepuesto}
          formatearMoneda={formatearMoneda}
        />

        {totalGeneral > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-4 rounded-md">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white">
              <span>TOTAL GENERAL:</span>
              <span className="text-2xl text-blue-600 dark:text-blue-400">
                ₡{formatearMoneda(totalGeneral)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div className="flex justify-between">
                <span>Servicios:</span>
                <span>₡{formatearMoneda(totalServicios)}</span>
              </div>
              <div className="flex justify-between">
                <span>Repuestos:</span>
                <span>₡{formatearMoneda(totalRepuestos)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="font-semibold">Estado de Pago:</span>
                <span
                  className={`font-semibold ${
                    [...servicios, ...repuestos].length > 0 &&
                    [...servicios, ...repuestos].every((item) => item.pagado === true)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {[...servicios, ...repuestos].length > 0 &&
                  [...servicios, ...repuestos].every((item) => item.pagado === true)
                    ? '✓ Pagado'
                    : '⏱ Pendiente'}
                </span>
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
  );
}

function ServiciosSection({
  servicios,
  onAgregar,
  onEliminar,
  onActualizarPagado,
  formatearMoneda,
}) {
  const [nuevo, setNuevo] = useState({ descripcion: '', precio: '', cantidad: 1, pagado: false });

  const handleAgregar = () => {
    if (nuevo.descripcion && nuevo.precio) {
      onAgregar(nuevo.descripcion, nuevo.precio, nuevo.cantidad, nuevo.pagado);
      setNuevo({ descripcion: '', precio: '', cantidad: 1, pagado: false });
    }
  };

  const total = servicios.reduce((sum, s) => sum + parseFloat(s.precio) * parseInt(s.cantidad), 0);

  return (
    <div className="border-b dark:border-gray-700 pb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Servicios Realizados
      </h3>

      {servicios.length > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="text-left py-2 dark:text-gray-300">Descripción</th>
                <th className="text-right py-2 dark:text-gray-300">Precio</th>
                <th className="text-center py-2 dark:text-gray-300">Cant.</th>
                <th className="text-right py-2 dark:text-gray-300">Subtotal</th>
                <th className="text-center py-2 dark:text-gray-300">Pagado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio, index) => (
                <tr
                  key={index}
                  className="border-b dark:border-gray-600 last:border-0 dark:text-gray-300"
                >
                  <td className="py-2">{servicio.descripcion}</td>
                  <td className="text-right">₡{formatearMoneda(parseFloat(servicio.precio))}</td>
                  <td className="text-center">{servicio.cantidad}</td>
                  <td className="text-right">
                    ₡{formatearMoneda(parseFloat(servicio.precio) * parseInt(servicio.cantidad))}
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={servicio.pagado || false}
                      onChange={(e) => onActualizarPagado(index, e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      title={servicio.pagado ? 'Pagado' : 'Pendiente'}
                    />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => onEliminar(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-lg"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold dark:text-white">
                <td colSpan="4" className="text-right py-2">
                  Total Servicios:
                </td>
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
            onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Descripción del servicio"
          />
        </div>
        <div className="md:col-span-3">
          <input
            type="number"
            value={nuevo.precio}
            onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
            step="0.01"
            min="0"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Precio"
          />
        </div>
        <div className="md:col-span-2">
          <input
            type="number"
            value={nuevo.cantidad}
            onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })}
            min="1"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
  );
}

function RepuestosSection({
  repuestos,
  onAgregar,
  onEliminar,
  onActualizarPagado,
  formatearMoneda,
}) {
  const [nuevo, setNuevo] = useState({
    nombre: '',
    precio_unitario: '',
    cantidad: 1,
    numero_factura: '',
    pagado: false,
  });

  const handleAgregar = () => {
    if (nuevo.nombre && nuevo.precio_unitario) {
      onAgregar(
        nuevo.nombre,
        nuevo.precio_unitario,
        nuevo.cantidad,
        nuevo.numero_factura,
        nuevo.pagado
      );
      setNuevo({ nombre: '', precio_unitario: '', cantidad: 1, numero_factura: '', pagado: false });
    }
  };

  const total = repuestos.reduce(
    (sum, r) => sum + parseFloat(r.precio_unitario) * parseInt(r.cantidad),
    0
  );

  return (
    <div className="border-b dark:border-gray-700 pb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Repuestos Utilizados
      </h3>

      {repuestos.length > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="text-left py-2 dark:text-gray-300">Nombre</th>
                <th className="text-left py-2 dark:text-gray-300">N° Factura</th>
                <th className="text-right py-2 dark:text-gray-300">Precio Unit.</th>
                <th className="text-center py-2 dark:text-gray-300">Cant.</th>
                <th className="text-right py-2 dark:text-gray-300">Subtotal</th>
                <th className="text-center py-2 dark:text-gray-300">Pagado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {repuestos.map((repuesto, index) => (
                <tr
                  key={index}
                  className="border-b dark:border-gray-600 last:border-0 dark:text-gray-300"
                >
                  <td className="py-2">{repuesto.nombre}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">
                    {repuesto.numero_factura || '-'}
                  </td>
                  <td className="text-right">
                    ₡{formatearMoneda(parseFloat(repuesto.precio_unitario))}
                  </td>
                  <td className="text-center">{repuesto.cantidad}</td>
                  <td className="text-right">
                    ₡
                    {formatearMoneda(
                      parseFloat(repuesto.precio_unitario) * parseInt(repuesto.cantidad)
                    )}
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={repuesto.pagado || false}
                      onChange={(e) => onActualizarPagado(index, e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      title={repuesto.pagado ? 'Pagado' : 'Pendiente'}
                    />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => onEliminar(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-lg"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold dark:text-white">
                <td colSpan="4" className="text-right py-2">
                  Total Repuestos:
                </td>
                <td className="text-right">₡{formatearMoneda(total)}</td>
                <td></td>
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
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nombre del repuesto"
            />
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              value={nuevo.numero_factura}
              onChange={(e) => setNuevo({ ...nuevo, numero_factura: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="N° Factura (opcional)"
            />
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              value={nuevo.precio_unitario}
              onChange={(e) => setNuevo({ ...nuevo, precio_unitario: e.target.value })}
              step="0.01"
              min="0"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Precio"
            />
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              value={nuevo.cantidad}
              onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })}
              min="1"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
    </div>
  );
}

export default FormularioFactura;
