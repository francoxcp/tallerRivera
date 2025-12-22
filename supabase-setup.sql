-- ========================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Taller Rivera - Sistema de Gestión de Facturas
-- ========================================

-- 1. CREAR LA TABLA DE FACTURAS
-- ========================================
CREATE TABLE IF NOT EXISTS facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT NOT NULL UNIQUE,
  cliente TEXT,
  vehiculo TEXT,
  placa TEXT,
  estado_pago TEXT NOT NULL CHECK (estado_pago IN ('pagado', 'pendiente')),
  observaciones TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE SERVICIOS
-- ========================================
CREATE TABLE IF NOT EXISTS factura_servicios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA DE REPUESTOS
-- ========================================
CREATE TABLE IF NOT EXISTS factura_repuestos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_servicios_factura ON factura_servicios(factura_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_factura ON factura_repuestos(factura_id);

-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- ========================================
COMMENT ON TABLE facturas IS 'Tabla principal para almacenar facturas del taller mecánico';
COMMENT ON COLUMN facturas.id IS 'Identificador único de la factura (UUID auto-generado)';
COMMENT ON COLUMN facturas.numero_factura IS 'Número de factura único (ej: FAC-001)';
COMMENT ON COLUMN facturas.cliente IS 'Nombre del cliente';
COMMENT ON COLUMN facturas.vehiculo IS 'Descripción del vehículo';
COMMENT ON COLUMN facturas.placa IS 'Placa del vehículo';
COMMENT ON COLUMN facturas.estado_pago IS 'Estado del pago: pagado o pendiente';
COMMENT ON COLUMN facturas.observaciones IS 'Observaciones generales de la factura';
COMMENT ON COLUMN facturas.fecha_creacion IS 'Fecha y hora de creación del registro';

COMMENT ON TABLE factura_servicios IS 'Servicios asociados a cada factura';
COMMENT ON TABLE factura_repuestos IS 'Repuestos asociados a cada factura';

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_repuestos ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS DE SEGURIDAD
-- ========================================

-- OPCIÓN A: Para desarrollo (permisiva)
-- Permite todas las operaciones sin autenticación
CREATE POLICY "Permitir todas las operaciones en facturas (desarrollo)" ON facturas
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en servicios (desarrollo)" ON factura_servicios
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en repuestos (desarrollo)" ON factura_repuestos
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

-- 8. DATOS DE EJEMPLO (OPCIONAL)
-- ========================================
-- Descomentar para insertar datos de prueba
/*
-- Insertar factura de ejemplo
INSERT INTO facturas (numero_factura, cliente, vehiculo, placa, estado_pago, observaciones) VALUES
  ('FAC-001', 'Juan Pérez', 'Toyota Corolla 2020', 'ABC-123', 'pendiente', 'Cliente frecuente');

-- Obtener el ID de la factura recién creada
DO $$
DECLARE
  factura_id UUID;
BEGIN
  SELECT id INTO factura_id FROM facturas WHERE numero_factura = 'FAC-001';
  
  -- Insertar servicios para esa factura
  INSERT INTO factura_servicios (factura_id, descripcion, precio, cantidad) VALUES
    (factura_id, 'Cambio de aceite', 50.00, 1),
    (factura_id, 'Alineación y balanceo', 80.00, 1),
    (factura_id, 'Revisión de frenos', 30.00, 1);
  
  -- Insertar repuestos para esa factura
  INSERT INTO factura_repuestos (factura_id, nombre, precio_unitario, cantidad) VALUES
    (factura_id, 'Filtro de aceite', 15.00, 1),
    (factura_id, 'Aceite sintético 5W-30', 45.00, 4),
    (factura_id, 'Pastillas de freno delanteras', 120.00, 1);
END $$;
*/

-- 9. VISTA PARA CONSULTAS CON TOTALES
-- ========================================
CREATE OR REPLACE VIEW vista_facturas_completas AS
SELECT 
  f.id,
  f.numero_factura,
  f.cliente,
  f.vehiculo,
  f.placa,
  f.estado_pago,
  f.observaciones,
  f.fecha_creacion,
  COALESCE(
    (SELECT SUM(precio * cantidad) FROM factura_servicios WHERE factura_id = f.id), 0
  ) AS total_servicios,
  COALESCE(
    (SELECT SUM(precio_unitario * cantidad) FROM factura_repuestos WHERE factura_id = f.id), 0
  ) AS total_repuestos,
  COALESCE(
    (SELECT SUM(precio * cantidad) FROM factura_servicios WHERE factura_id = f.id), 0
  ) + COALESCE(
    (SELECT SUM(precio_unitario * cantidad) FROM factura_repuestos WHERE factura_id = f.id), 0
  ) AS total_general
FROM facturas f
ORDER BY f.fecha_creacion DESC;

-- 10. FUNCIÓN PARA OBTENER ESTADÍSTICAS
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
    COALESCE(SUM(total_general) FILTER (WHERE estado_pago = 'pagado'), 0) AS monto_total_pagado,
    COALESCE(SUM(total_general) FILTER (WHERE estado_pago = 'pendiente'), 0) AS monto_total_pendiente
  FROM vista_facturas_completas;
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
-- SELECT * FROM factura_servicios;
-- SELECT * FROM factura_repuestos;
-- SELECT * FROM vista_facturas_completas;
-- SELECT * FROM obtener_estadisticas_facturas();
