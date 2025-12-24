import { useState, useEffect } from 'react';
import ListaFacturas from './ListaFacturas';
import Toast from './Toast';
import { facturasService } from '../services/facturasService';
import { useToast } from '../hooks/useToast';

function VerFacturas({ onEditar }) {
  const [facturas, setFacturas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const { toasts, hideToast, success, error: showError, warning } = useToast();

  useEffect(() => {
    cargarFacturas();
  }, [filtroEstado]);

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      let datos;

      if (filtroEstado === 'todas') {
        datos = await facturasService.obtenerFacturas();
      } else {
        datos = await facturasService.filtrarPorEstado(filtroEstado);
      }

      setFacturas(datos);
    } catch (err) {
      showError('❌ Error al cargar las facturas: ' + err.message);
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async () => {
    if (busqueda.trim()) {
      try {
        setCargando(true);
        const datos = await facturasService.buscarPorPlaca(busqueda);
        if (datos.length === 0) {
          warning('⚠️ No se encontraron facturas con esa placa');
        } else {
          success(`✓ Se encontraron ${datos.length} factura(s)`);
        }
        setFacturas(datos);
      } catch (err) {
        showError('❌ Error en la búsqueda: ' + err.message);
      } finally {
        setCargando(false);
      }
    } else {
      cargarFacturas();
    }
  };

  const handleEliminarFactura = async (id) => {
    if (
      window.confirm('¿Estás seguro de eliminar esta factura? Esta acción no se puede deshacer.')
    ) {
      try {
        await facturasService.eliminarFactura(id);
        success('✅ Factura eliminada exitosamente');
        await cargarFacturas();
      } catch (err) {
        showError('❌ Error al eliminar la factura: ' + err.message);
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Todas las Facturas</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Consulta y gestiona todas las facturas del taller
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar por placa del vehículo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                placeholder="Ej: ABC-123"
                className="flex-1 px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
              />
              <button
                onClick={handleBuscar}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                🔍 Buscar
              </button>
              {busqueda && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    cargarFacturas();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default VerFacturas;
