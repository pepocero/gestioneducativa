-- Script para corregir las políticas RLS de enrollments
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Students can view their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Professors can view enrollments for their subjects" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;

-- Crear nuevas políticas que funcionen con subjects_new
CREATE POLICY "Students can view their enrollments" ON enrollments
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        ) OR
        subject_id IN (
            SELECT s.id FROM subjects_new s
            WHERE s.institution_id = get_user_institution_id()
        )
    );

CREATE POLICY "Professors can view enrollments for their subjects" ON enrollments
    FOR SELECT USING (
        subject_id IN (
            SELECT ps.subject_id FROM professor_subjects ps
            WHERE ps.professor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage enrollments" ON enrollments
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects_new s
            WHERE s.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'enrollments';


