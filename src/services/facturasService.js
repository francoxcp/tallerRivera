import { supabase } from './supabase';

export const facturasService = {
  // Obtener todas las facturas con sus servicios y repuestos
  async obtenerFacturas() {
    const { data, error } = await supabase
      .from('facturas')
      .select(
        `
        *,
        factura_servicios (*),
        factura_repuestos (*)
      `
      )
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener una factura por ID con servicios y repuestos
  async obtenerFacturaPorId(id) {
    const { data, error } = await supabase
      .from('facturas')
      .select(
        `
        *,
        factura_servicios (*),
        factura_repuestos (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva factura con servicios y repuestos
  async crearFactura(factura) {
    const { servicios, repuestos, ...facturaData } = factura;

    // 1. Crear la factura
    const { data: nuevaFactura, error: errorFactura } = await supabase
      .from('facturas')
      .insert([facturaData])
      .select()
      .single();

    if (errorFactura) throw errorFactura;

    // 2. Crear los servicios si existen
    if (servicios && servicios.length > 0) {
      const serviciosConFacturaId = servicios.map((s) => ({
        ...s,
        factura_id: nuevaFactura.id,
      }));

      const { error: errorServicios } = await supabase
        .from('factura_servicios')
        .insert(serviciosConFacturaId);

      if (errorServicios) throw errorServicios;
    }

    // 3. Crear los repuestos si existen
    if (repuestos && repuestos.length > 0) {
      const repuestosConFacturaId = repuestos.map((r) => ({
        ...r,
        factura_id: nuevaFactura.id,
      }));

      const { error: errorRepuestos } = await supabase
        .from('factura_repuestos')
        .insert(repuestosConFacturaId);

      if (errorRepuestos) throw errorRepuestos;
    }

    // 4. Retornar la factura completa
    return await this.obtenerFacturaPorId(nuevaFactura.id);
  },

  // Actualizar factura
  async actualizarFactura(id, actualizacion) {
    const { servicios, repuestos, ...facturaData } = actualizacion;

    // 1. Actualizar datos de la factura
    const { data, error } = await supabase
      .from('facturas')
      .update(facturaData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 2. Si se enviaron servicios, eliminar los antiguos y crear los nuevos
    if (servicios !== undefined) {
      await supabase.from('factura_servicios').delete().eq('factura_id', id);

      if (servicios.length > 0) {
        const serviciosConFacturaId = servicios.map((s) => ({
          ...s,
          factura_id: id,
        }));
        await supabase.from('factura_servicios').insert(serviciosConFacturaId);
      }
    }

    // 3. Si se enviaron repuestos, eliminar los antiguos y crear los nuevos
    if (repuestos !== undefined) {
      await supabase.from('factura_repuestos').delete().eq('factura_id', id);

      if (repuestos.length > 0) {
        const repuestosConFacturaId = repuestos.map((r) => ({
          ...r,
          factura_id: id,
        }));
        await supabase.from('factura_repuestos').insert(repuestosConFacturaId);
      }
    }

    return await this.obtenerFacturaPorId(id);
  },

  // Eliminar factura (se eliminan servicios y repuestos automáticamente por CASCADE)
  async eliminarFactura(id) {
    const { error } = await supabase.from('facturas').delete().eq('id', id);

    if (error) throw error;
  },

  // Buscar facturas por placa del vehículo
  async buscarPorPlaca(placa) {
    const { data, error } = await supabase
      .from('facturas')
      .select(
        `
        *,
        factura_servicios (*),
        factura_repuestos (*)
      `
      )
      .ilike('placa', `%${placa}%`)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Filtrar por estado de pago
  async filtrarPorEstado(estadoPago) {
    const { data, error } = await supabase
      .from('facturas')
      .select(
        `
        *,
        factura_servicios (*),
        factura_repuestos (*)
      `
      )
      .eq('estado_pago', estadoPago)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Calcular totales de una factura
  calcularTotales(factura) {
    const totalServicios = (factura.factura_servicios || []).reduce(
      (sum, s) => sum + s.precio * s.cantidad,
      0
    );
    const totalRepuestos = (factura.factura_repuestos || []).reduce(
      (sum, r) => sum + r.precio_unitario * r.cantidad,
      0
    );
    return {
      totalServicios,
      totalRepuestos,
      totalGeneral: totalServicios + totalRepuestos,
    };
  },
};
