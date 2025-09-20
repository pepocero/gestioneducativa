-- Script completo para corregir políticas RLS de instituciones
-- Ejecutar en Supabase SQL Editor

-- Primero, eliminar las políticas existentes de institutions si existen
DROP POLICY IF EXISTS "Institutions can be viewed by institution admins" ON institutions;
DROP POLICY IF EXISTS "Institutions can be updated by institution admins" ON institutions;

-- Política para INSERT: Permitir que usuarios autenticados creen instituciones
CREATE POLICY "Authenticated users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para SELECT: Los admins pueden ver todas las instituciones
-- (necesario para la página de administración de instituciones)
CREATE POLICY "Admins can view all institutions" ON institutions
    FOR SELECT USING (is_institution_admin());

-- Política para UPDATE: Solo los admins pueden actualizar instituciones
CREATE POLICY "Admins can update institutions" ON institutions
    FOR UPDATE USING (is_institution_admin());

-- Política para DELETE: Solo los admins pueden eliminar instituciones
CREATE POLICY "Admins can delete institutions" ON institutions
    FOR DELETE USING (is_institution_admin());
