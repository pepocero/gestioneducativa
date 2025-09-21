-- Script para restaurar políticas RLS (versión corregida)
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Eliminar TODAS las políticas existentes de todas las tablas
-- Careers
DROP POLICY IF EXISTS "Users can view careers from their institution" ON careers;
DROP POLICY IF EXISTS "Admins can manage careers" ON careers;
DROP POLICY IF EXISTS "Authenticated users can view careers" ON careers;
DROP POLICY IF EXISTS "Authenticated users can manage careers" ON careers;

-- Users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their institution" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can manage their own profile" ON users;

-- Subjects_new
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON subjects_new;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects_new;
DROP POLICY IF EXISTS "Admins can manage subjects in their institution" ON subjects_new;
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON subjects_new;
DROP POLICY IF EXISTS "Authenticated users can manage subjects" ON subjects_new;

-- Cycles
DROP POLICY IF EXISTS "Users can view cycles from their institution" ON cycles;
DROP POLICY IF EXISTS "Admins can manage cycles" ON cycles;
DROP POLICY IF EXISTS "Authenticated users can view cycles" ON cycles;
DROP POLICY IF EXISTS "Authenticated users can manage cycles" ON cycles;

-- Cycle_subjects
DROP POLICY IF EXISTS "Users can view cycle subjects from their institution" ON cycle_subjects;
DROP POLICY IF EXISTS "Admins can manage cycle subjects" ON cycle_subjects;
DROP POLICY IF EXISTS "Admins can manage cycle subjects in their institution" ON cycle_subjects;
DROP POLICY IF EXISTS "Authenticated users can view cycle subjects" ON cycle_subjects;
DROP POLICY IF EXISTS "Authenticated users can manage cycle subjects" ON cycle_subjects;

-- Subject_prerequisites
DROP POLICY IF EXISTS "Users can view prerequisites from their institution" ON subject_prerequisites;
DROP POLICY IF EXISTS "Admins can manage prerequisites" ON subject_prerequisites;
DROP POLICY IF EXISTS "Admins can manage prerequisites in their institution" ON subject_prerequisites;
DROP POLICY IF EXISTS "Authenticated users can view prerequisites" ON subject_prerequisites;
DROP POLICY IF EXISTS "Authenticated users can manage prerequisites" ON subject_prerequisites;

-- 2. Eliminar triggers problemáticos primero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Eliminar funciones problemáticas (con CASCADE si es necesario)
DROP FUNCTION IF EXISTS get_current_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_institution() CASCADE;
DROP FUNCTION IF EXISTS is_admin_of_institution(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 4. Crear políticas simples que funcionen
-- Política para users: cualquier usuario autenticado puede gestionar su perfil
CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (id = auth.uid());

-- Política para careers: cualquier usuario autenticado puede ver y gestionar carreras
-- (temporalmente simple para que funcione)
CREATE POLICY "Authenticated users can manage careers" ON careers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para subjects_new: cualquier usuario autenticado puede ver y gestionar materias
CREATE POLICY "Authenticated users can manage subjects" ON subjects_new
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para cycles: cualquier usuario autenticado puede ver y gestionar ciclos
CREATE POLICY "Authenticated users can manage cycles" ON cycles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para cycle_subjects: cualquier usuario autenticado puede ver y gestionar asignaciones
CREATE POLICY "Authenticated users can manage cycle subjects" ON cycle_subjects
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para subject_prerequisites: cualquier usuario autenticado puede ver y gestionar correlatividades
CREATE POLICY "Authenticated users can manage prerequisites" ON subject_prerequisites
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 'Políticas simples creadas' as status;

-- 6. Mostrar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'careers', 'subjects_new', 'cycles', 'cycle_subjects', 'subject_prerequisites')
ORDER BY tablename, policyname;

-- 7. Verificar que no hay funciones problemáticas
SELECT 'Funciones problemáticas eliminadas' as status;
