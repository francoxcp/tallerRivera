import { useState, useEffect } from 'react'
import ListaFacturas from './ListaFacturas'
import Toast from './Toast'
import { facturasService } from '../services/facturasService'
import { useToast } from '../hooks/useToast'

function VerFacturas({ onEditar }) {
  const [facturas, setFacturas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const { toasts, hideToast, success, error: showError, warning } = useToast()

  useEffect(() => {
    cargarFacturas()
  }, [filtroEstado])

  const cargarFacturas = async () => {
    try {
      setCargando(true)
      let datos
      
      if (filtroEstado === 'todas') {
        datos = await facturasService.obtenerFacturas()
      } else {
        datos = await facturasService.filtrarPorEstado(filtroEstado)
      }
      
      setFacturas(datos)
    } catch (err) {
      showError('❌ Error al cargar las facturas: ' + err.message)
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
        if (datos.length === 0) {
          warning('⚠️ No se encontraron facturas con esa placa')
        } else {
          success(`✓ Se encontraron ${datos.length} factura(s)`)
        }
        setFacturas(datos)
      } catch (err) {
        showError('❌ Error en la búsqueda: ' + err.message)
      } finally {
        setCargando(false)
      }
    } else {
      cargarFacturas()
    }
  }

  const handleEliminarFactura = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta factura? Esta acción no se puede deshacer.')) {
      try {
        await facturasService.eliminarFactura(id)
        success('✅ Factura eliminada exitosamente')
        await cargarFacturas()
      } catch (err) {
        showError('❌ Error al eliminar la factura: ' + err.message)
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

      {/* Lista de facturas */}
      <ListaFacturas
        facturas={facturas}
        onEditar={onEditar}
        onEliminar={handleEliminarFactura}
        cargando={cargando}
      />

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default VerFacturas
