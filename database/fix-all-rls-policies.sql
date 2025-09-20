-- Script completo para corregir todas las políticas RLS
-- Este script debe ejecutarse en Supabase SQL Editor
-- IMPORTANTE: Ejecutar después de que ya existan usuarios e instituciones

-- ==============================================
-- PASO 1: Eliminar todas las políticas existentes
-- ==============================================

-- Eliminar políticas de institutions
DROP POLICY IF EXISTS "Institutions can be viewed by institution admins" ON institutions;
DROP POLICY IF EXISTS "Institutions can be updated by institution admins" ON institutions;
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can view all institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can update institutions" ON institutions;
DROP POLICY IF EXISTS "Admins can delete institutions" ON institutions;

-- Eliminar políticas de users
DROP POLICY IF EXISTS "Users can view institution users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Eliminar políticas de careers
DROP POLICY IF EXISTS "Careers can be viewed by institution users" ON careers;
DROP POLICY IF EXISTS "Admins can manage careers" ON careers;

-- Eliminar políticas de cycles
DROP POLICY IF EXISTS "Cycles can be viewed by institution users" ON cycles;
DROP POLICY IF EXISTS "Admins can manage cycles" ON cycles;

-- Eliminar políticas de subjects
DROP POLICY IF EXISTS "Subjects can be viewed by institution users" ON subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;

-- Eliminar políticas de professor_subjects
DROP POLICY IF EXISTS "Professors can view their subjects" ON professor_subjects;
DROP POLICY IF EXISTS "Admins can manage professor subjects" ON professor_subjects;

-- Eliminar políticas de students
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Admins can manage students" ON students;

-- Eliminar políticas de enrollments
DROP POLICY IF EXISTS "Students can view their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Professors can view enrollments for their subjects" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;

-- Eliminar políticas de grades
DROP POLICY IF EXISTS "Students can view their grades" ON grades;
DROP POLICY IF EXISTS "Professors can manage grades for their subjects" ON grades;
DROP POLICY IF EXISTS "Admins can view all institution grades" ON grades;

-- Eliminar políticas de correlatives
DROP POLICY IF EXISTS "Correlatives can be viewed by institution users" ON correlatives;
DROP POLICY IF EXISTS "Admins can manage correlatives" ON correlatives;

-- ==============================================
-- PASO 2: Crear políticas correctas para INSTITUTIONS
-- ==============================================

-- Permitir que usuarios autenticados creen instituciones (para el primer registro)
CREATE POLICY "Authenticated users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Los usuarios pueden ver solo las instituciones de las que son miembros
CREATE POLICY "Users can view their institution" ON institutions
    FOR SELECT USING (
        id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Solo los admins pueden actualizar su institución
CREATE POLICY "Admins can update their institution" ON institutions
    FOR UPDATE USING (
        id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo los admins pueden eliminar su institución
CREATE POLICY "Admins can delete their institution" ON institutions
    FOR DELETE USING (
        id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 3: Crear políticas correctas para USERS
-- ==============================================

-- Los usuarios pueden ver otros usuarios de su institución
CREATE POLICY "Users can view institution users" ON users
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- Solo los admins pueden crear usuarios en su institución
CREATE POLICY "Admins can create users in their institution" ON users
    FOR INSERT WITH CHECK (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo los admins pueden eliminar usuarios de su institución
CREATE POLICY "Admins can delete users from their institution" ON users
    FOR DELETE USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 4: Crear políticas correctas para CAREERS
-- ==============================================

-- Los usuarios pueden ver carreras de su institución
CREATE POLICY "Users can view institution careers" ON careers
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar carreras de su institución
CREATE POLICY "Admins can manage institution careers" ON careers
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 5: Crear políticas correctas para CYCLES
-- ==============================================

-- Los usuarios pueden ver ciclos de carreras de su institución
CREATE POLICY "Users can view institution cycles" ON cycles
    FOR SELECT USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar ciclos de su institución
CREATE POLICY "Admins can manage institution cycles" ON cycles
    FOR ALL USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- PASO 6: Crear políticas correctas para SUBJECTS
-- ==============================================

-- Los usuarios pueden ver materias de su institución
CREATE POLICY "Users can view institution subjects" ON subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar materias de su institución
CREATE POLICY "Admins can manage institution subjects" ON subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- PASO 7: Crear políticas correctas para PROFESSOR_SUBJECTS
-- ==============================================

-- Los profesores pueden ver sus asignaciones
CREATE POLICY "Professors can view their subject assignments" ON professor_subjects
    FOR SELECT USING (
        professor_id = auth.uid() OR
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar asignaciones de profesores
CREATE POLICY "Admins can manage professor assignments" ON professor_subjects
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- PASO 8: Crear políticas correctas para STUDENTS
-- ==============================================

-- Los estudiantes pueden ver su propia información
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (
        user_id = auth.uid() OR
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar estudiantes de su institución
CREATE POLICY "Admins can manage institution students" ON students
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 9: Crear políticas correctas para ENROLLMENTS
-- ==============================================

-- Los estudiantes pueden ver sus inscripciones
CREATE POLICY "Students can view their enrollments" ON enrollments
    FOR SELECT USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE user_id = auth.uid()
        ) OR
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- Los profesores pueden ver inscripciones de sus materias
CREATE POLICY "Professors can view enrollments for their subjects" ON enrollments
    FOR SELECT USING (
        subject_id IN (
            SELECT ps.subject_id 
            FROM professor_subjects ps
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar inscripciones de su institución
CREATE POLICY "Admins can manage institution enrollments" ON enrollments
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- PASO 10: Crear políticas correctas para GRADES
-- ==============================================

-- Los estudiantes pueden ver sus calificaciones
CREATE POLICY "Students can view their grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id 
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Los profesores pueden gestionar calificaciones de sus materias
CREATE POLICY "Professors can manage grades for their subjects" ON grades
    FOR ALL USING (
        professor_id = auth.uid() AND
        enrollment_id IN (
            SELECT e.id 
            FROM enrollments e
            JOIN professor_subjects ps ON e.subject_id = ps.subject_id
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Los admins pueden ver todas las calificaciones de su institución
CREATE POLICY "Admins can view all institution grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id 
            FROM enrollments e
            JOIN subjects s ON e.subject_id = s.id
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- PASO 11: Crear políticas correctas para CORRELATIVES
-- ==============================================

-- Los usuarios pueden ver correlatividades de su institución
CREATE POLICY "Users can view institution correlatives" ON correlatives
    FOR SELECT USING (
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar correlatividades de su institución
CREATE POLICY "Admins can manage institution correlatives" ON correlatives
    FOR ALL USING (
        subject_id IN (
            SELECT sub.id 
            FROM subjects sub
            JOIN cycles c ON sub.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- ==============================================
-- FIN DEL SCRIPT
-- ==============================================

-- Verificar que todas las políticas estén creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
