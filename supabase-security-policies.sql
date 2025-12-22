-- Actualizar políticas de seguridad RLS (Row Level Security)
-- Estas políticas aseguran que solo usuarios autenticados puedan acceder a los datos

-- Habilitar RLS en todas las tablas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_repuestos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Permitir todas las operaciones" ON facturas;
DROP POLICY IF EXISTS "Permitir todas las operaciones" ON factura_servicios;
DROP POLICY IF EXISTS "Permitir todas las operaciones" ON factura_repuestos;

-- POLÍTICAS PARA TABLA FACTURAS
-- Solo usuarios autenticados pueden leer facturas
CREATE POLICY "Usuarios autenticados pueden leer facturas"
ON facturas FOR SELECT
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden insertar facturas
CREATE POLICY "Usuarios autenticados pueden crear facturas"
ON facturas FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar facturas
CREATE POLICY "Usuarios autenticados pueden actualizar facturas"
ON facturas FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar facturas
CREATE POLICY "Usuarios autenticados pueden eliminar facturas"
ON facturas FOR DELETE
TO authenticated
USING (true);

-- POLÍTICAS PARA TABLA FACTURA_SERVICIOS
-- Solo usuarios autenticados pueden leer servicios
CREATE POLICY "Usuarios autenticados pueden leer servicios"
ON factura_servicios FOR SELECT
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden insertar servicios
CREATE POLICY "Usuarios autenticados pueden crear servicios"
ON factura_servicios FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar servicios
CREATE POLICY "Usuarios autenticados pueden actualizar servicios"
ON factura_servicios FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar servicios
CREATE POLICY "Usuarios autenticados pueden eliminar servicios"
ON factura_servicios FOR DELETE
TO authenticated
USING (true);

-- POLÍTICAS PARA TABLA FACTURA_REPUESTOS
-- Solo usuarios autenticados pueden leer repuestos
CREATE POLICY "Usuarios autenticados pueden leer repuestos"
ON factura_repuestos FOR SELECT
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden insertar repuestos
CREATE POLICY "Usuarios autenticados pueden crear repuestos"
ON factura_repuestos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar repuestos
CREATE POLICY "Usuarios autenticados pueden actualizar repuestos"
ON factura_repuestos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar repuestos
CREATE POLICY "Usuarios autenticados pueden eliminar repuestos"
ON factura_repuestos FOR DELETE
TO authenticated
USING (true);

-- Verificar que las políticas se aplicaron correctamente
-- Puedes ejecutar este query para verificar:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
