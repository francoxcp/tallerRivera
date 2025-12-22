-- ========================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Taller Rivera - Sistema de Gestión de Facturas
-- ========================================

-- 1. CREAR LA TABLA DE FACTURAS
-- ========================================
CREATE TABLE IF NOT EXISTS facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT NOT NULL UNIQUE,
  precio_repuesto DECIMAL(10,2) DEFAULT 0,
  precio_servicio DECIMAL(10,2) DEFAULT 0,
  detalle TEXT,
  estado_pago TEXT NOT NULL CHECK (estado_pago IN ('pagado', 'pendiente')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_creacion DESC);

-- 3. COMENTARIOS PARA DOCUMENTACIÓN
-- ========================================
COMMENT ON TABLE facturas IS 'Tabla principal para almacenar facturas del taller mecánico';
COMMENT ON COLUMN facturas.id IS 'Identificador único de la factura (UUID auto-generado)';
COMMENT ON COLUMN facturas.numero_factura IS 'Número de factura único (ej: FAC-001)';
COMMENT ON COLUMN facturas.precio_repuesto IS 'Precio total de los repuestos utilizados';
COMMENT ON COLUMN facturas.precio_servicio IS 'Precio del servicio de mano de obra';
COMMENT ON COLUMN facturas.detalle IS 'Descripción detallada del trabajo realizado';
COMMENT ON COLUMN facturas.estado_pago IS 'Estado del pago: pagado o pendiente';
COMMENT ON COLUMN facturas.fecha_creacion IS 'Fecha y hora de creación del registro';

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD
-- ========================================

-- OPCIÓN A: Para desarrollo (permisiva)
-- Permite todas las operaciones sin autenticación
CREATE POLICY "Permitir todas las operaciones en facturas (desarrollo)" ON facturas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- OPCIÓN B: Para producción (comentar la política anterior y descomentar estas)
-- Requiere autenticación para todas las operaciones
/*
CREATE POLICY "Usuarios autenticados pueden ver facturas" ON facturas
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar facturas" ON facturas
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar facturas" ON facturas
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar facturas" ON facturas
  FOR DELETE
  USING (auth.role() = 'authenticated');
*/

-- 6. DATOS DE EJEMPLO (OPCIONAL)
-- ========================================
-- Descomentar para insertar datos de prueba
/*
INSERT INTO facturas (numero_factura, precio_repuesto, precio_servicio, detalle, estado_pago) VALUES
  ('FAC-001', 150.00, 80.00, 'Cambio de aceite y filtros', 'pagado'),
  ('FAC-002', 320.00, 120.00, 'Cambio de pastillas de freno delanteras', 'pendiente'),
  ('FAC-003', 0.00, 50.00, 'Revisión general del vehículo', 'pagado'),
  ('FAC-004', 450.00, 200.00, 'Cambio de batería y alineación', 'pendiente'),
  ('FAC-005', 180.00, 90.00, 'Cambio de llantas traseras', 'pagado');
*/

-- 7. VISTA PARA CONSULTAS CON TOTALES (OPCIONAL)
-- ========================================
CREATE OR REPLACE VIEW vista_facturas_con_total AS
SELECT 
  id,
  numero_factura,
  precio_repuesto,
  precio_servicio,
  (precio_repuesto + precio_servicio) AS total,
  detalle,
  estado_pago,
  fecha_creacion
FROM facturas
ORDER BY fecha_creacion DESC;

-- 8. FUNCIÓN PARA OBTENER ESTADÍSTICAS (OPCIONAL)
-- ========================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_facturas()
RETURNS TABLE (
  total_facturas BIGINT,
  total_pagadas BIGINT,
  total_pendientes BIGINT,
  monto_total_pagado DECIMAL,
  monto_total_pendiente DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_facturas,
    COUNT(*) FILTER (WHERE estado_pago = 'pagado')::BIGINT AS total_pagadas,
    COUNT(*) FILTER (WHERE estado_pago = 'pendiente')::BIGINT AS total_pendientes,
    COALESCE(SUM(precio_repuesto + precio_servicio) FILTER (WHERE estado_pago = 'pagado'), 0) AS monto_total_pagado,
    COALESCE(SUM(precio_repuesto + precio_servicio) FILTER (WHERE estado_pago = 'pendiente'), 0) AS monto_total_pendiente
  FROM facturas;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

-- Para ejecutar este script:
-- 1. Abre tu proyecto en Supabase (https://supabase.com/dashboard)
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Haz clic en "Run" o presiona Ctrl+Enter
-- 5. Verifica que todas las operaciones se ejecutaron correctamente

-- Consultas útiles para verificar:
-- SELECT * FROM facturas;
-- SELECT * FROM vista_facturas_con_total;
-- SELECT * FROM obtener_estadisticas_facturas();
