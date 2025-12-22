-- Actualizar estructura de la tabla facturas
-- Agregar campos de cliente y cédula directamente en facturas
ALTER TABLE facturas 
ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS cliente_cedula VARCHAR(50);

-- Agregar campos de fechas de entrada y salida del vehículo
ALTER TABLE facturas
ADD COLUMN IF NOT EXISTS fecha_entrada DATE,
ADD COLUMN IF NOT EXISTS fecha_salida DATE;

-- Cambiar placa como identificador principal (único)
CREATE UNIQUE INDEX IF NOT EXISTS idx_facturas_placa_unique ON facturas(placa);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_nombre ON facturas(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_cedula ON facturas(cliente_cedula);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_entrada ON facturas(fecha_entrada);

-- Actualizar tabla factura_repuestos para incluir numero_factura
-- Este campo permite registrar múltiples facturas de proveedores por repuesto
ALTER TABLE factura_repuestos
ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(100);

-- Crear índice para búsquedas por número de factura de repuestos
CREATE INDEX IF NOT EXISTS idx_repuestos_numero_factura ON factura_repuestos(numero_factura);

-- Nota: La placa del vehículo ahora es el identificador único de cada trabajo/factura
-- El numero_factura en factura_repuestos permite vincular repuestos a facturas de proveedores
