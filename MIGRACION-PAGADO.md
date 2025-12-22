# 🔧 Migración: Agregar Estado de Pago Individual

## 📋 Descripción
Esta migración agrega la columna `pagado` a las tablas `factura_servicios` y `factura_repuestos` para permitir el seguimiento individual del estado de pago de cada servicio y repuesto.

## 🚀 Cómo aplicar la migración

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. **Accede a tu proyecto en Supabase**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, busca **"SQL Editor"**
   - Haz clic en **"+ New query"**

3. **Ejecuta el script**
   - Copia todo el contenido del archivo `supabase-add-pagado-column.sql`
   - Pégalo en el editor
   - Haz clic en **"Run"** (o presiona Ctrl+Enter)

4. **Verifica el resultado**
   - Deberías ver un mensaje de éxito
   - Las columnas se habrán agregado correctamente

### Opción 2: Usando la CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

## ✅ Verificación

Para verificar que la migración se aplicó correctamente:

```sql
-- Verifica que la columna existe en factura_servicios
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'factura_servicios' 
AND column_name = 'pagado';

-- Verifica que la columna existe en factura_repuestos
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'factura_repuestos' 
AND column_name = 'pagado';
```

## 📊 Impacto

- **Servicios existentes**: Se marcarán como NO pagados (FALSE) por defecto
- **Repuestos existentes**: Se marcarán como NO pagados (FALSE) por defecto
- **Nuevos registros**: Tendrán el valor FALSE por defecto hasta que se marquen como pagados

## 🎯 Funcionalidad Nueva

Después de aplicar esta migración, podrás:

1. ✅ Marcar servicios individuales como pagados o pendientes
2. ✅ Marcar repuestos individuales como pagados o pendientes
3. ✅ Ver el estado de pago con indicadores visuales:
   - **✓ Verde**: Pagado
   - **⏱ Amarillo**: Pendiente
4. ✅ Editar el estado de pago directamente desde el formulario de factura

## 🔄 Actualizar datos existentes (Opcional)

Si necesitas marcar algunos servicios o repuestos como pagados:

```sql
-- Marcar un servicio específico como pagado
UPDATE factura_servicios 
SET pagado = TRUE 
WHERE id = 'uuid-del-servicio';

-- Marcar todos los servicios de una factura como pagados
UPDATE factura_servicios 
SET pagado = TRUE 
WHERE factura_id = 'uuid-de-la-factura';

-- Marcar un repuesto específico como pagado
UPDATE factura_repuestos 
SET pagado = TRUE 
WHERE id = 'uuid-del-repuesto';
```

## ⚠️ Importante

- Esta migración es **segura** y **no destructiva**
- No elimina ni modifica datos existentes
- Solo agrega nuevas columnas con valores por defecto
- Los índices mejoran el rendimiento de las consultas

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que tienes permisos de administrador en Supabase
2. Revisa los logs de error en el SQL Editor
3. Asegúrate de que las tablas `factura_servicios` y `factura_repuestos` existen
