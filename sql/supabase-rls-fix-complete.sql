-- ========================================
-- SCRIPT DE LIMPIEZA Y FIX COMPLETO DE RLS
-- Taller Rivera - Arreglar políticas que no funcionan
-- ========================================

-- 0. DIAGNÓSTICO: Ver estado actual
-- ========================================
-- Ejecuta esta query para ver qué políticas hay actualmente:
-- SELECT schemaname, tablename, policyname, qual, with_check FROM pg_policies 
-- WHERE tablename IN ('facturas', 'factura_servicios', 'factura_repuestos');

-- 1. DESHABILITAR RLS TEMPORALMENTE
-- ========================================
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE factura_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE factura_repuestos DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS (IMPORTANTES)
-- ========================================
DROP POLICY IF EXISTS "Permitir todas las operaciones en facturas (desarrollo)" ON facturas CASCADE;
DROP POLICY IF EXISTS "Permitir todas las operaciones en servicios (desarrollo)" ON factura_servicios CASCADE;
DROP POLICY IF EXISTS "Permitir todas las operaciones en repuestos (desarrollo)" ON factura_repuestos CASCADE;

-- Eliminar cualquier otra política existente
DROP POLICY IF EXISTS "Usuarios autenticados leen solo sus facturas" ON facturas CASCADE;
DROP POLICY IF EXISTS "Usuarios autenticados crean facturas" ON facturas CASCADE;
DROP POLICY IF EXISTS "Usuarios actualizan solo sus facturas" ON facturas CASCADE;
DROP POLICY IF EXISTS "Usuarios eliminan solo sus facturas" ON facturas CASCADE;

DROP POLICY IF EXISTS "Usuarios leen servicios de sus facturas" ON factura_servicios CASCADE;
DROP POLICY IF EXISTS "Usuarios crean servicios en sus facturas" ON factura_servicios CASCADE;
DROP POLICY IF EXISTS "Usuarios actualizan servicios de sus facturas" ON factura_servicios CASCADE;
DROP POLICY IF EXISTS "Usuarios eliminan servicios de sus facturas" ON factura_servicios CASCADE;

DROP POLICY IF EXISTS "Usuarios leen repuestos de sus facturas" ON factura_repuestos CASCADE;
DROP POLICY IF EXISTS "Usuarios crean repuestos en sus facturas" ON factura_repuestos CASCADE;
DROP POLICY IF EXISTS "Usuarios actualizan repuestos de sus facturas" ON factura_repuestos CASCADE;
DROP POLICY IF EXISTS "Usuarios eliminan repuestos de sus facturas" ON factura_repuestos CASCADE;

-- 3. AGREGAR COLUMNA user_id SI NO EXISTE
-- ========================================
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE factura_servicios ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE factura_repuestos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 4. CREAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_facturas_user ON facturas(user_id);
CREATE INDEX IF NOT EXISTS idx_servicios_user ON factura_servicios(user_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_user ON factura_repuestos(user_id);

-- 5. VOLVER A HABILITAR RLS
-- ========================================
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_repuestos ENABLE ROW LEVEL SECURITY;

-- 6. CREAR NUEVAS POLÍTICAS (MÁS RESTRICTIVAS)
-- ========================================

-- ========== POLÍTICAS PARA FACTURAS ==========

-- SELECT: Solo puede leer facturas propias Y si es autenticado
CREATE POLICY "rls_facturas_select" ON facturas
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INSERT: Solo usuarios autenticados pueden crear, y se asigna a sí mismo
CREATE POLICY "rls_facturas_insert" ON facturas
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- UPDATE: Solo el propietario puede actualizar
CREATE POLICY "rls_facturas_update" ON facturas
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- DELETE: Solo el propietario puede eliminar
CREATE POLICY "rls_facturas_delete" ON facturas
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ========== POLÍTICAS PARA SERVICIOS ==========

-- SELECT: Solo si la factura pertenece al usuario
CREATE POLICY "rls_servicios_select" ON factura_servicios
FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_servicios.factura_id 
  AND facturas.user_id = auth.uid()
));

-- INSERT: Solo si la factura es suya
CREATE POLICY "rls_servicios_insert" ON factura_servicios
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_servicios.factura_id 
  AND facturas.user_id = auth.uid()
));

-- UPDATE: Solo si la factura es suya
CREATE POLICY "rls_servicios_update" ON factura_servicios
FOR UPDATE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_servicios.factura_id 
  AND facturas.user_id = auth.uid()
));

-- DELETE: Solo si la factura es suya
CREATE POLICY "rls_servicios_delete" ON factura_servicios
FOR DELETE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_servicios.factura_id 
  AND facturas.user_id = auth.uid()
));

-- ========== POLÍTICAS PARA REPUESTOS ==========

-- SELECT: Solo si la factura pertenece al usuario
CREATE POLICY "rls_repuestos_select" ON factura_repuestos
FOR SELECT
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_repuestos.factura_id 
  AND facturas.user_id = auth.uid()
));

-- INSERT: Solo si la factura es suya
CREATE POLICY "rls_repuestos_insert" ON factura_repuestos
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_repuestos.factura_id 
  AND facturas.user_id = auth.uid()
));

-- UPDATE: Solo si la factura es suya
CREATE POLICY "rls_repuestos_update" ON factura_repuestos
FOR UPDATE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_repuestos.factura_id 
  AND facturas.user_id = auth.uid()
));

-- DELETE: Solo si la factura es suya
CREATE POLICY "rls_repuestos_delete" ON factura_repuestos
FOR DELETE
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM facturas 
  WHERE facturas.id = factura_repuestos.factura_id 
  AND facturas.user_id = auth.uid()
));

-- 7. CREAR FUNCIÓN PARA AUTO-ASIGNAR USER_ID
-- ========================================
CREATE OR REPLACE FUNCTION public.assign_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREAR O REEMPLAZAR TRIGGERS
-- ========================================
DROP TRIGGER IF EXISTS set_user_id_facturas ON facturas CASCADE;
DROP TRIGGER IF EXISTS set_user_id_servicios ON factura_servicios CASCADE;
DROP TRIGGER IF EXISTS set_user_id_repuestos ON factura_repuestos CASCADE;

CREATE TRIGGER set_user_id_facturas
BEFORE INSERT ON facturas
FOR EACH ROW
EXECUTE FUNCTION public.assign_user_id();

CREATE TRIGGER set_user_id_servicios
BEFORE INSERT ON factura_servicios
FOR EACH ROW
EXECUTE FUNCTION public.assign_user_id();

CREATE TRIGGER set_user_id_repuestos
BEFORE INSERT ON factura_repuestos
FOR EACH ROW
EXECUTE FUNCTION public.assign_user_id();

-- 9. MIGRACIÓN DE DATOS EXISTENTES
-- ========================================
-- IMPORTANTE: Ejecutar esto si tienes facturas sin user_id
-- Asigna todas las facturas sin propietario al usuario especificado
-- CAMBIA 'fe.taller.rivera@gmail.com' por un usuario test si quieres
/*
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Obtener ID del usuario (cambia el email si es necesario)
  SELECT id INTO test_user_id FROM auth.users 
  WHERE email = 'fe.taller.rivera@gmail.com' LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    UPDATE facturas SET user_id = test_user_id WHERE user_id IS NULL;
    UPDATE factura_servicios SET user_id = test_user_id WHERE user_id IS NULL;
    UPDATE factura_repuestos SET user_id = test_user_id WHERE user_id IS NULL;
  END IF;
END $$;
*/

-- 10. VERIFICACIÓN FINAL
-- ========================================
-- Ejecutar estas queries para verificar:
/*
-- Ver todas las políticas activas
SELECT tablename, policyname, qual, with_check FROM pg_policies 
WHERE tablename IN ('facturas', 'factura_servicios', 'factura_repuestos')
ORDER BY tablename, policyname;

-- Ver RLS habilitado en cada tabla
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('facturas', 'factura_servicios', 'factura_repuestos');

-- Ver datos sin user_id (deberían estar vacío después de migración)
SELECT COUNT(*) FROM facturas WHERE user_id IS NULL;
SELECT COUNT(*) FROM factura_servicios WHERE user_id IS NULL;
SELECT COUNT(*) FROM factura_repuestos WHERE user_id IS NULL;
*/

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
