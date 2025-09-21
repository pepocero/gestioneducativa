-- Script de corrección para políticas RLS del Flujo 2
-- Este script debe ejecutarse en Supabase SQL Editor

-- Primero, vamos a verificar si existe la tabla users y qué datos tiene
-- Si no existe o está vacía, necesitamos políticas más permisivas temporalmente

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON subjects_new;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects_new;
DROP POLICY IF EXISTS "Users can view cycle subjects from their institution" ON cycle_subjects;
DROP POLICY IF EXISTS "Admins can manage cycle subjects" ON cycle_subjects;
DROP POLICY IF EXISTS "Users can view prerequisites from their institution" ON subject_prerequisites;
DROP POLICY IF EXISTS "Admins can manage prerequisites" ON subject_prerequisites;

-- Crear políticas más permisivas temporalmente para desarrollo
-- Estas políticas permiten a cualquier usuario autenticado hacer operaciones
-- En producción, deberías ajustar estas políticas según tu modelo de usuarios

-- Política para subjects_new - Permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Authenticated users can manage subjects" ON subjects_new
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para cycle_subjects - Permitir todas las operaciones a usuarios autenticados  
CREATE POLICY "Authenticated users can manage cycle subjects" ON cycle_subjects
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para subject_prerequisites - Permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Authenticated users can manage prerequisites" ON subject_prerequisites
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('subjects_new', 'cycle_subjects', 'subject_prerequisites')
ORDER BY tablename, policyname;

-- Comentario: Estas políticas son muy permisivas y solo deben usarse en desarrollo
-- En producción, deberías implementar políticas más restrictivas basadas en:
-- 1. Una tabla de usuarios/instituciones real
-- 2. Roles específicos de usuario
-- 3. Verificación de pertenencia a instituciones
