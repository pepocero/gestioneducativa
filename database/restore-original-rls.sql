-- Script para restaurar políticas RLS que funcionaban antes
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Eliminar todas las políticas problemáticas que agregué
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their institution" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Authenticated users can view careers" ON careers;
DROP POLICY IF EXISTS "Authenticated users can manage careers" ON careers;

DROP POLICY IF EXISTS "Authenticated users can view subjects" ON subjects_new;
DROP POLICY IF EXISTS "Authenticated users can manage subjects" ON subjects_new;

DROP POLICY IF EXISTS "Authenticated users can view cycles" ON cycles;
DROP POLICY IF EXISTS "Authenticated users can manage cycles" ON cycles;

DROP POLICY IF EXISTS "Authenticated users can view cycle subjects" ON cycle_subjects;
DROP POLICY IF EXISTS "Authenticated users can manage cycle subjects" ON cycle_subjects;

DROP POLICY IF EXISTS "Authenticated users can view prerequisites" ON subject_prerequisites;
DROP POLICY IF EXISTS "Authenticated users can manage prerequisites" ON subject_prerequisites;

-- 2. Restaurar políticas originales que funcionaban para careers
-- (Estas son las políticas que ya existían y funcionaban)
CREATE POLICY "Users can view careers from their institution" ON careers
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage careers" ON careers
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- 3. Políticas simples para users (sin recursión)
CREATE POLICY "Users can manage their own profile" ON users
    FOR ALL USING (id = auth.uid());

-- 4. Políticas simples para subjects_new (sin recursión)
CREATE POLICY "Users can view subjects from their institution" ON subjects_new
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage subjects" ON subjects_new
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- 5. Políticas simples para cycles (sin recursión)
CREATE POLICY "Users can view cycles from their institution" ON cycles
    FOR SELECT USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            WHERE c.institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage cycles" ON cycles
    FOR ALL USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            WHERE c.institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- 6. Políticas simples para cycle_subjects (sin recursión)
CREATE POLICY "Users can view cycle subjects from their institution" ON cycle_subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage cycle subjects" ON cycle_subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- 7. Políticas simples para subject_prerequisites (sin recursión)
CREATE POLICY "Users can view prerequisites from their institution" ON subject_prerequisites
    FOR SELECT USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage prerequisites" ON subject_prerequisites
    FOR ALL USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- 8. Eliminar funciones problemáticas que causan recursión
DROP FUNCTION IF EXISTS get_current_user();
DROP FUNCTION IF EXISTS get_user_institution();
DROP FUNCTION IF EXISTS is_admin_of_institution(UUID);

-- 9. Eliminar trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 10. Verificar que las políticas se crearon correctamente
SELECT 'Políticas originales restauradas' as status;

-- 11. Mostrar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'careers', 'subjects_new', 'cycles', 'cycle_subjects', 'subject_prerequisites')
ORDER BY table_name, policyname;
