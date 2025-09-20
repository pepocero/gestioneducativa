-- Script para eliminar TODAS las políticas RLS problemáticas y crear una solución simple
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Eliminar TODAS las políticas RLS
-- ==============================================

-- Eliminar todas las políticas de institutions
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can update their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can delete their institution" ON institutions;

-- Eliminar todas las políticas de users
DROP POLICY IF EXISTS "Users can view institution users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can create users in their institution" ON users;
DROP POLICY IF EXISTS "Admins can delete users from their institution" ON users;

-- Eliminar todas las políticas de careers
DROP POLICY IF EXISTS "Users can view institution careers" ON careers;
DROP POLICY IF EXISTS "Admins can manage institution careers" ON careers;

-- Eliminar todas las políticas de cycles
DROP POLICY IF EXISTS "Users can view institution cycles" ON cycles;
DROP POLICY IF EXISTS "Admins can manage institution cycles" ON cycles;

-- Eliminar todas las políticas de subjects
DROP POLICY IF EXISTS "Users can view institution subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can manage institution subjects" ON subjects;

-- Eliminar todas las políticas de professor_subjects
DROP POLICY IF EXISTS "Professors can view their subject assignments" ON professor_subjects;
DROP POLICY IF EXISTS "Admins can manage professor assignments" ON professor_subjects;

-- Eliminar todas las políticas de students
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Admins can manage institution students" ON students;

-- Eliminar todas las políticas de enrollments
DROP POLICY IF EXISTS "Students can view their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Professors can view enrollments for their subjects" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage institution enrollments" ON enrollments;

-- Eliminar todas las políticas de grades
DROP POLICY IF EXISTS "Students can view their grades" ON grades;
DROP POLICY IF EXISTS "Professors can manage grades for their subjects" ON grades;
DROP POLICY IF EXISTS "Admins can view all institution grades" ON grades;

-- Eliminar todas las políticas de correlatives
DROP POLICY IF EXISTS "Users can view institution correlatives" ON correlatives;
DROP POLICY IF EXISTS "Admins can manage institution correlatives" ON correlatives;

-- ==============================================
-- PASO 2: Crear políticas SIMPLES sin recursión
-- ==============================================

-- INSTITUTIONS: Políticas simples
CREATE POLICY "Anyone can create institutions" ON institutions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view institutions" ON institutions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update institutions" ON institutions
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete institutions" ON institutions
    FOR DELETE USING (true);

-- USERS: Políticas simples
CREATE POLICY "Anyone can view users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Anyone can create users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete users" ON users
    FOR DELETE USING (true);

-- CAREERS: Políticas simples
CREATE POLICY "Anyone can view careers" ON careers
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage careers" ON careers
    FOR ALL USING (true);

-- CYCLES: Políticas simples
CREATE POLICY "Anyone can view cycles" ON cycles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage cycles" ON cycles
    FOR ALL USING (true);

-- SUBJECTS: Políticas simples
CREATE POLICY "Anyone can view subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage subjects" ON subjects
    FOR ALL USING (true);

-- PROFESSOR_SUBJECTS: Políticas simples
CREATE POLICY "Anyone can view professor subjects" ON professor_subjects
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage professor subjects" ON professor_subjects
    FOR ALL USING (true);

-- STUDENTS: Políticas simples
CREATE POLICY "Anyone can view students" ON students
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage students" ON students
    FOR ALL USING (true);

-- ENROLLMENTS: Políticas simples
CREATE POLICY "Anyone can view enrollments" ON enrollments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage enrollments" ON enrollments
    FOR ALL USING (true);

-- GRADES: Políticas simples
CREATE POLICY "Anyone can view grades" ON grades
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage grades" ON grades
    FOR ALL USING (true);

-- CORRELATIVES: Políticas simples
CREATE POLICY "Anyone can view correlatives" ON correlatives
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage correlatives" ON correlatives
    FOR ALL USING (true);

-- ==============================================
-- VERIFICACIÓN
-- ==============================================

-- Verificar que todas las políticas estén creadas
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
