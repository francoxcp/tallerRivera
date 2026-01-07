-- ========================================================================================================
-- ESTRUCTURA ESENCIAL DE BASE DE DATOS - TALLER RIVERA
-- ========================================================================================================
-- Fecha: 7 de enero 2026
-- Autor: Franco (@francoxcp)
-- Descripción: Script con tablas, vistas, funciones y triggers esenciales
-- ========================================================================================================

BEGIN;

-- ========================================================================================================
-- 1. TABLAS PRINCIPALES
-- ========================================================================================================

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT UNIQUE,
  cliente TEXT,
  vehiculo TEXT,
  placa TEXT,
  estado_pago TEXT NOT NULL CHECK (estado_pago IN ('pagado', 'pendiente')) DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_nombre VARCHAR(255),
  cliente_cedula VARCHAR(50),
  fecha_entrada DATE,
  fecha_salida DATE
);

-- Tabla de Servicios
CREATE TABLE IF NOT EXISTS factura_servicios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad INTEGER DEFAULT 1,
  pagado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla de Repuestos
CREATE TABLE IF NOT EXISTS factura_repuestos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 1,
  pagado BOOLEAN DEFAULT FALSE,
  numero_factura VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nombre CHARACTER VARYING NOT NULL,
  telefono CHARACTER VARYING,
  email CHARACTER VARYING,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========================================================================================================
-- 2. ÍNDICES
-- ========================================================================================================

CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_facturas_user_id ON facturas(user_id);
CREATE INDEX IF NOT EXISTS idx_facturas_placa ON facturas(placa);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_nombre ON facturas(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_cedula ON facturas(cliente_cedula);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_entrada ON facturas(fecha_entrada);

CREATE INDEX IF NOT EXISTS idx_servicios_factura ON factura_servicios(factura_id);
CREATE INDEX IF NOT EXISTS idx_servicios_user_id ON factura_servicios(user_id);
CREATE INDEX IF NOT EXISTS idx_servicios_pagado ON factura_servicios(pagado);

CREATE INDEX IF NOT EXISTS idx_repuestos_factura ON factura_repuestos(factura_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_user_id ON factura_repuestos(user_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_pagado ON factura_repuestos(pagado);
CREATE INDEX IF NOT EXISTS idx_repuestos_numero_factura ON factura_repuestos(numero_factura);

CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);

-- ========================================================================================================
-- 3. FUNCIONES
-- ========================================================================================================

-- Función para auto-asignar user_id
CREATE OR REPLACE FUNCTION public.assign_user_id()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_facturas()
RETURNS TABLE (
  total_facturas BIGINT,
  total_pagadas BIGINT,
  total_pendientes BIGINT,
  monto_total_pagado DECIMAL,
  monto_total_pendiente DECIMAL
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_facturas,
    COUNT(*) FILTER (WHERE estado_pago = 'pagado')::BIGINT AS total_pagadas,
    COUNT(*) FILTER (WHERE estado_pago = 'pendiente')::BIGINT AS total_pendientes,
    COALESCE(SUM(total_general) FILTER (WHERE estado_pago = 'pagado'), 0) AS monto_total_pagado,
    COALESCE(SUM(total_general) FILTER (WHERE estado_pago = 'pendiente'), 0) AS monto_total_pendiente
  FROM vista_facturas_completas
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- ========================================================================================================
-- 4. VISTA
-- ========================================================================================================

CREATE OR REPLACE VIEW vista_facturas_completas
WITH (security_invoker = true)
AS
SELECT 
  f.id,
  f.numero_factura,
  f.cliente,
  f.vehiculo,
  f.placa,
  f.estado_pago,
  f.observaciones,
  f.fecha_creacion,
  f.user_id,
  f.cliente_nombre,
  f.cliente_cedula,
  f.fecha_entrada,
  f.fecha_salida,
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

-- ========================================================================================================
-- 5. TRIGGERS
-- ========================================================================================================

-- Triggers para auto-asignar user_id
DROP TRIGGER IF EXISTS trigger_facturas_user_id ON facturas;
CREATE TRIGGER trigger_facturas_user_id
  BEFORE INSERT ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_id();

DROP TRIGGER IF EXISTS trigger_servicios_user_id ON factura_servicios;
CREATE TRIGGER trigger_servicios_user_id
  BEFORE INSERT ON factura_servicios
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_id();

DROP TRIGGER IF EXISTS trigger_repuestos_user_id ON factura_repuestos;
CREATE TRIGGER trigger_repuestos_user_id
  BEFORE INSERT ON factura_repuestos
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_id();

DROP TRIGGER IF EXISTS trigger_clientes_user_id ON clientes;
CREATE TRIGGER trigger_clientes_user_id
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_id();

-- Trigger para updated_at en clientes
DROP TRIGGER IF EXISTS trigger_clientes_updated_at ON clientes;
CREATE TRIGGER trigger_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ========================================================================================================

-- Habilitar RLS
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para Facturas
DROP POLICY IF EXISTS "rls_facturas_select" ON facturas;
CREATE POLICY "rls_facturas_select" ON facturas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_facturas_insert" ON facturas;
CREATE POLICY "rls_facturas_insert" ON facturas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_facturas_update" ON facturas;
CREATE POLICY "rls_facturas_update" ON facturas
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_facturas_delete" ON facturas;
CREATE POLICY "rls_facturas_delete" ON facturas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Servicios
DROP POLICY IF EXISTS "rls_servicios_select" ON factura_servicios;
CREATE POLICY "rls_servicios_select" ON factura_servicios
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_servicios.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_servicios_insert" ON factura_servicios;
CREATE POLICY "rls_servicios_insert" ON factura_servicios
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_servicios.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_servicios_update" ON factura_servicios;
CREATE POLICY "rls_servicios_update" ON factura_servicios
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_servicios.factura_id AND facturas.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_servicios.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_servicios_delete" ON factura_servicios;
CREATE POLICY "rls_servicios_delete" ON factura_servicios
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_servicios.factura_id AND facturas.user_id = auth.uid()
  ));

-- Políticas para Repuestos
DROP POLICY IF EXISTS "rls_repuestos_select" ON factura_repuestos;
CREATE POLICY "rls_repuestos_select" ON factura_repuestos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_repuestos.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_repuestos_insert" ON factura_repuestos;
CREATE POLICY "rls_repuestos_insert" ON factura_repuestos
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_repuestos.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_repuestos_update" ON factura_repuestos;
CREATE POLICY "rls_repuestos_update" ON factura_repuestos
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_repuestos.factura_id AND facturas.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_repuestos.factura_id AND facturas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "rls_repuestos_delete" ON factura_repuestos;
CREATE POLICY "rls_repuestos_delete" ON factura_repuestos
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM facturas WHERE facturas.id = factura_repuestos.factura_id AND facturas.user_id = auth.uid()
  ));

-- Políticas para Clientes
DROP POLICY IF EXISTS "rls_clientes_select" ON clientes;
CREATE POLICY "rls_clientes_select" ON clientes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_clientes_insert" ON clientes;
CREATE POLICY "rls_clientes_insert" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_clientes_update" ON clientes;
CREATE POLICY "rls_clientes_update" ON clientes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rls_clientes_delete" ON clientes;
CREATE POLICY "rls_clientes_delete" ON clientes
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================================================================================
-- 7. COMENTARIOS
-- ========================================================================================================

COMMENT ON TABLE facturas IS 'Tabla principal de facturas del taller';
COMMENT ON TABLE factura_servicios IS 'Servicios asociados a cada factura';
COMMENT ON TABLE factura_repuestos IS 'Repuestos asociados a cada factura';
COMMENT ON TABLE clientes IS 'Información de clientes del taller';

COMMENT ON FUNCTION public.assign_user_id() IS 'Auto-asigna user_id al insertar registros';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at';
COMMENT ON FUNCTION public.obtener_estadisticas_facturas() IS 'Obtiene estadísticas de facturas del usuario';

COMMENT ON VIEW vista_facturas_completas IS 'Vista con totales calculados. Usa SECURITY INVOKER';

COMMIT;
