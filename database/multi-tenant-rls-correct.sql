-- Script para implementar Multi-Tenancy correcto con Supabase RLS
-- Solución para evitar recursión infinita usando funciones auxiliares
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Eliminar TODAS las políticas existentes
-- ==============================================

-- Eliminar todas las políticas de institutions
DROP POLICY IF EXISTS "Anyone can create institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can view institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can update institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can delete institutions" ON institutions;
DROP POLICY IF EXISTS "Users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can update their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can delete their institution" ON institutions;
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can view all institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can update institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can delete institutions" ON institutions;

-- Eliminar todas las políticas de users
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can create users" ON users;
DROP POLICY IF EXISTS "Anyone can delete users" ON users;
DROP POLICY IF EXISTS "Users can view institution users" ON users;
DROP POLICY IF EXISTS "Admins can create users in their institution" ON users;
DROP POLICY IF EXISTS "Admins can delete users from their institution" ON users;

-- Eliminar todas las políticas de careers
DROP POLICY IF EXISTS "Anyone can view careers" ON careers;
DROP POLICY IF EXISTS "Anyone can manage careers" ON careers;
DROP POLICY IF EXISTS "Users can view institution careers" ON careers;
DROP POLICY IF EXISTS "Admins can manage institution careers" ON careers;

-- Eliminar todas las políticas de cycles
DROP POLICY IF EXISTS "Anyone can view cycles" ON cycles;
DROP POLICY IF EXISTS "Anyone can manage cycles" ON cycles;
DROP POLICY IF EXISTS "Users can view institution cycles" ON cycles;
DROP POLICY IF EXISTS "Admins can manage institution cycles" ON cycles;

-- Eliminar todas las políticas de subjects
DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Users can view institution subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can manage institution subjects" ON subjects;

-- Eliminar todas las políticas de professor_subjects
DROP POLICY IF EXISTS "Anyone can view professor subjects" ON professor_subjects;
DROP POLICY IF EXISTS "Anyone can manage professor subjects" ON professor_subjects;
DROP POLICY IF EXISTS "Professors can view their subject assignments" ON professor_subjects;
DROP POLICY IF EXISTS "Admins can manage professor assignments" ON professor_subjects;

-- Eliminar todas las políticas de students
DROP POLICY IF EXISTS "Anyone can view students" ON students;
DROP POLICY IF EXISTS "Anyone can manage students" ON students;
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Admins can manage institution students" ON students;

-- Eliminar todas las políticas de enrollments
DROP POLICY IF EXISTS "Anyone can view enrollments" ON enrollments;
DROP POLICY IF EXISTS "Anyone can manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can view their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Professors can view enrollments for their subjects" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage institution enrollments" ON enrollments;

-- Eliminar todas las políticas de grades
DROP POLICY IF EXISTS "Anyone can view grades" ON grades;
DROP POLICY IF EXISTS "Anyone can manage grades" ON grades;
DROP POLICY IF EXISTS "Students can view their grades" ON grades;
DROP POLICY IF EXISTS "Professors can manage grades for their subjects" ON grades;
DROP POLICY IF EXISTS "Admins can view all institution grades" ON grades;

-- Eliminar todas las políticas de correlatives
DROP POLICY IF EXISTS "Anyone can view correlatives" ON correlatives;
DROP POLICY IF EXISTS "Anyone can manage correlatives" ON correlatives;
DROP POLICY IF EXISTS "Users can view institution correlatives" ON correlatives;
DROP POLICY IF EXISTS "Admins can manage institution correlatives" ON correlatives;

-- ==============================================
-- PASO 2: Crear funciones auxiliares con SECURITY DEFINER
-- ==============================================

-- Función para obtener el institution_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin' 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es profesor
CREATE OR REPLACE FUNCTION is_user_professor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'professor' 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es estudiante
CREATE OR REPLACE FUNCTION is_user_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'student' 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 3: Crear políticas RLS usando las funciones auxiliares
-- ==============================================

-- POLÍTICAS PARA INSTITUTIONS
CREATE POLICY "Users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their institution" ON institutions
    FOR SELECT USING (id = get_user_institution_id());

CREATE POLICY "Admins can update their institution" ON institutions
    FOR UPDATE USING (id = get_user_institution_id() AND is_user_admin());

CREATE POLICY "Admins can delete their institution" ON institutions
    FOR DELETE USING (id = get_user_institution_id() AND is_user_admin());

-- POLÍTICAS PARA USERS
CREATE POLICY "Users can view institution users" ON users
    FOR SELECT USING (institution_id = get_user_institution_id());

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can create users in their institution" ON users
    FOR INSERT WITH CHECK (
        institution_id = get_user_institution_id() AND is_user_admin()
    );

CREATE POLICY "Admins can delete users from their institution" ON users
    FOR DELETE USING (
        institution_id = get_user_institution_id() AND is_user_admin()
    );

-- POLÍTICAS PARA CAREERS
CREATE POLICY "Users can view institution careers" ON careers
    FOR SELECT USING (institution_id = get_user_institution_id());

CREATE POLICY "Admins can manage institution careers" ON careers
    FOR ALL USING (institution_id = get_user_institution_id() AND is_user_admin());

-- POLÍTICAS PARA CYCLES
CREATE POLICY "Users can view institution cycles" ON cycles
    FOR SELECT USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Admins can manage institution cycles" ON cycles
    FOR ALL USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        ) AND is_user_admin()
    );

-- POLÍTICAS PARA SUBJECTS
CREATE POLICY "Users can view institution subjects" ON subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Admins can manage institution subjects" ON subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_user_admin()
    );

-- POLÍTICAS PARA PROFESSOR_SUBJECTS
CREATE POLICY "Professors can view their subject assignments" ON professor_subjects
    FOR SELECT USING (
        professor_id = auth.uid() OR
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Admins can manage professor assignments" ON professor_subjects
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_user_admin()
    );

-- POLÍTICAS PARA STUDENTS
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (
        user_id = auth.uid() OR
        institution_id = get_user_institution_id()
    );

CREATE POLICY "Admins can manage institution students" ON students
    FOR ALL USING (institution_id = get_user_institution_id() AND is_user_admin());

-- POLÍTICAS PARA ENROLLMENTS
CREATE POLICY "Students can view their enrollments" ON enrollments
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        ) OR
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Professors can view enrollments for their subjects" ON enrollments
    FOR SELECT USING (
        subject_id IN (
            SELECT ps.subject_id FROM professor_subjects ps
            WHERE ps.professor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage institution enrollments" ON enrollments
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_user_admin()
    );

-- POLÍTICAS PARA GRADES
CREATE POLICY "Students can view their grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Professors can manage grades for their subjects" ON grades
    FOR ALL USING (
        professor_id = auth.uid() AND
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN professor_subjects ps ON e.subject_id = ps.subject_id
            WHERE ps.professor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all institution grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN subjects s ON e.subject_id = s.id
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- POLÍTICAS PARA CORRELATIVES
CREATE POLICY "Users can view institution correlatives" ON correlatives
    FOR SELECT USING (
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Admins can manage institution correlatives" ON correlatives
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_user_admin()
    );

-- ==============================================
-- VERIFICACIÓN
-- ==============================================

-- Verificar que todas las políticas estén creadas
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
