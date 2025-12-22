import { supabase } from './supabase'

export const facturasService = {
  // Obtener todas las facturas
  async obtenerFacturas() {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener una factura por ID
  async obtenerFacturaPorId(id) {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear nueva factura
  async crearFactura(factura) {
    const { data, error } = await supabase
      .from('facturas')
      .insert([factura])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar factura
  async actualizarFactura(id, actualizacion) {
    const { data, error } = await supabase
      .from('facturas')
      .update(actualizacion)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar factura
  async eliminarFactura(id) {
    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Buscar facturas por número
  async buscarPorNumero(numeroFactura) {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .ilike('numero_factura', `%${numeroFactura}%`)
    
    if (error) throw error
    return data
  },

  // Filtrar por estado de pago
  async filtrarPorEstado(estadoPago) {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('estado_pago', estadoPago)
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return data
  }
}
