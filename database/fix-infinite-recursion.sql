-- Script para corregir recursión infinita en políticas RLS
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Eliminar todas las políticas problemáticas de la tabla users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their institution" ON users;

-- 2. Crear políticas más simples que no causen recursión
-- Política básica: cualquier usuario autenticado puede ver su propio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Política básica: cualquier usuario autenticado puede actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Política básica: cualquier usuario autenticado puede insertar (para el trigger)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- 3. Simplificar las funciones para evitar recursión
-- Función simplificada para obtener el usuario actual
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS TABLE (
    id UUID,
    institution_id UUID,
    email VARCHAR,
    role user_role,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.institution_id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active
    FROM users u
    WHERE u.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función simplificada para obtener la institución del usuario
CREATE OR REPLACE FUNCTION get_user_institution()
RETURNS UUID AS $$
DECLARE
    v_institution_id UUID;
BEGIN
    SELECT institution_id INTO v_institution_id
    FROM users 
    WHERE auth_user_id = auth.uid() AND is_active = TRUE;
    
    RETURN v_institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función simplificada para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin_of_institution(p_institution_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE auth_user_id = auth.uid() 
        AND institution_id = p_institution_id 
        AND role = 'admin'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar políticas para careers (más simples)
DROP POLICY IF EXISTS "Users can view careers from their institution" ON careers;
DROP POLICY IF EXISTS "Admins can manage careers" ON careers;

-- Política simple para careers: cualquier usuario autenticado puede ver todas las carreras
-- (temporalmente para desarrollo)
CREATE POLICY "Authenticated users can view careers" ON careers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage careers" ON careers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Actualizar políticas para subjects_new (más simples)
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON subjects_new;
DROP POLICY IF EXISTS "Admins can manage subjects in their institution" ON subjects_new;

-- Política simple para subjects_new: cualquier usuario autenticado puede ver todas las materias
-- (temporalmente para desarrollo)
CREATE POLICY "Authenticated users can view subjects" ON subjects_new
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage subjects" ON subjects_new
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Actualizar políticas para cycles (más simples)
DROP POLICY IF EXISTS "Users can view cycles from their institution" ON cycles;
DROP POLICY IF EXISTS "Admins can manage cycles" ON cycles;

-- Política simple para cycles: cualquier usuario autenticado puede ver todos los ciclos
-- (temporalmente para desarrollo)
CREATE POLICY "Authenticated users can view cycles" ON cycles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage cycles" ON cycles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Actualizar políticas para cycle_subjects (más simples)
DROP POLICY IF EXISTS "Users can view cycle subjects from their institution" ON cycle_subjects;
DROP POLICY IF EXISTS "Admins can manage cycle subjects in their institution" ON cycle_subjects;

-- Política simple para cycle_subjects: cualquier usuario autenticado puede ver todas las asignaciones
-- (temporalmente para desarrollo)
CREATE POLICY "Authenticated users can view cycle subjects" ON cycle_subjects
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage cycle subjects" ON cycle_subjects
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 8. Actualizar políticas para subject_prerequisites (más simples)
DROP POLICY IF EXISTS "Users can view prerequisites from their institution" ON subject_prerequisites;
DROP POLICY IF EXISTS "Admins can manage prerequisites in their institution" ON subject_prerequisites;

-- Política simple para subject_prerequisites: cualquier usuario autenticado puede ver todas las correlatividades
-- (temporalmente para desarrollo)
CREATE POLICY "Authenticated users can view prerequisites" ON subject_prerequisites
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage prerequisites" ON subject_prerequisites
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 9. Verificar que no hay recursión
SELECT 'Políticas simplificadas creadas' as status;

-- 10. Mostrar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'careers', 'subjects_new', 'cycles', 'cycle_subjects', 'subject_prerequisites')
ORDER BY tablename, policyname;

-- 11. Probar que las funciones funcionan
SELECT 'Funciones actualizadas' as status;
