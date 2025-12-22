import { supabase } from './supabase'

// Obtener todos los clientes
export const obtenerClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

// Buscar clientes por nombre o teléfono
export const buscarClientes = async (termino) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .or(`nombre.ilike.%${termino}%,telefono.ilike.%${termino}%,email.ilike.%${termino}%`)
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

// Obtener un cliente por ID
export const obtenerClientePorId = async (id) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Crear nuevo cliente
export const crearCliente = async (cliente) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      nombre: cliente.nombre,
      telefono: cliente.telefono || null,
      email: cliente.email || null,
      direccion: cliente.direccion || null,
      notas: cliente.notas || null,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualizar cliente
export const actualizarCliente = async (id, cliente) => {
  const { data, error } = await supabase
    .from('clientes')
    .update({
      nombre: cliente.nombre,
      telefono: cliente.telefono || null,
      email: cliente.email || null,
      direccion: cliente.direccion || null,
      notas: cliente.notas || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Eliminar cliente
export const eliminarCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Obtener historial de facturas de un cliente
export const obtenerFacturasCliente = async (clienteId) => {
  const { data, error } = await supabase
    .from('facturas')
    .select(`
      *,
      factura_servicios (*),
      factura_repuestos (*)
    `)
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Obtener estadísticas de un cliente
export const obtenerEstadisticasCliente = async (clienteId) => {
  const facturas = await obtenerFacturasCliente(clienteId)
  
  const totalFacturas = facturas.length
  const totalGastado = facturas.reduce((sum, factura) => {
    const totalServicios = factura.factura_servicios?.reduce((s, serv) => 
      s + (parseFloat(serv.precio) * parseInt(serv.cantidad)), 0) || 0
    const totalRepuestos = factura.factura_repuestos?.reduce((s, rep) => 
      s + (parseFloat(rep.precio_unitario) * parseInt(rep.cantidad)), 0) || 0
    return sum + totalServicios + totalRepuestos
  }, 0)

  const facturasPendientes = facturas.filter(f => f.estado_pago === 'pendiente').length
  const facturasPagadas = facturas.filter(f => f.estado_pago === 'pagado').length

  return {
    totalFacturas,
    totalGastado,
    facturasPendientes,
    facturasPagadas,
    ultimaVisita: facturas[0]?.created_at || null
  }
}

export const clientesService = {
  obtenerClientes,
  buscarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerFacturasCliente,
  obtenerEstadisticasCliente
}
