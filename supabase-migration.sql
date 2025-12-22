-- ========================================
-- SCRIPT DE MIGRACIÓN - ELIMINAR TABLAS ANTIGUAS
-- Taller Rivera - Sistema de Gestión de Facturas
-- ========================================

-- ADVERTENCIA: Este script eliminará todas las tablas y datos existentes
-- Asegúrate de hacer un respaldo si tienes datos importantes

-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ========================================
DROP POLICY IF EXISTS "Permitir todas las operaciones en facturas (desarrollo)" ON facturas;
DROP POLICY IF EXISTS "Permitir todas las operaciones en servicios (desarrollo)" ON factura_servicios;
DROP POLICY IF EXISTS "Permitir todas las operaciones en repuestos (desarrollo)" ON factura_repuestos;

-- 2. ELIMINAR VISTAS Y FUNCIONES
-- ========================================
DROP VIEW IF EXISTS vista_facturas_completas CASCADE;
DROP VIEW IF EXISTS vista_facturas_con_total CASCADE;
DROP FUNCTION IF EXISTS obtener_estadisticas_facturas() CASCADE;

-- 3. ELIMINAR TABLAS EN ORDEN (por las relaciones de foreign keys)
-- ========================================
DROP TABLE IF EXISTS factura_servicios CASCADE;
DROP TABLE IF EXISTS factura_repuestos CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;

-- ========================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ========================================

-- Ahora ejecuta el script principal (supabase-setup.sql) para crear las nuevas tablas
