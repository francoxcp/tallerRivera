-- ========================================
-- MIGRACIÓN: Agregar columna 'pagado' a servicios y repuestos
-- Fecha: 22 de diciembre 2025
-- Descripción: Permite rastrear el estado de pago individual de cada servicio y repuesto
-- ========================================

-- 1. Agregar columna 'pagado' a factura_servicios
-- ========================================
ALTER TABLE factura_servicios 
ADD COLUMN IF NOT EXISTS pagado BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna 'pagado' a factura_repuestos
-- ========================================
ALTER TABLE factura_repuestos 
ADD COLUMN IF NOT EXISTS pagado BOOLEAN DEFAULT FALSE;

-- 3. Crear índices para mejorar rendimiento en consultas de pago
-- ========================================
CREATE INDEX IF NOT EXISTS idx_servicios_pagado ON factura_servicios(pagado);
CREATE INDEX IF NOT EXISTS idx_repuestos_pagado ON factura_repuestos(pagado);

-- 4. Agregar comentarios para documentación
-- ========================================
COMMENT ON COLUMN factura_servicios.pagado IS 'Indica si el servicio ha sido pagado por el cliente';
COMMENT ON COLUMN factura_repuestos.pagado IS 'Indica si el repuesto ha sido pagado por el cliente';

-- ========================================
-- NOTAS:
-- - Todos los servicios y repuestos existentes se marcarán como NO pagados (FALSE) por defecto
-- - Si necesitas marcar algunos como pagados, ejecuta UPDATE después de esta migración
-- - Ejemplo: UPDATE factura_servicios SET pagado = TRUE WHERE id = 'uuid-del-servicio';
-- ========================================
