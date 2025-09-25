-- Políticas RLS (Row Level Security) para el Sistema de Gestión Educativa
-- Este script debe ejecutarse después del schema.sql en Supabase SQL Editor

-- Habilitar RLS en todas las tablas (con manejo de errores)
DO $$ BEGIN
    ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE professor_subjects ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE correlatives ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Función helper para obtener el institution_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para verificar si el usuario es admin de su institución
CREATE OR REPLACE FUNCTION is_institution_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin' 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para verificar si el usuario es profesor
CREATE OR REPLACE FUNCTION is_professor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'professor' 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para INSTITUTIONS
-- Solo los admins pueden ver y modificar su propia institución
DROP POLICY IF EXISTS "Institutions can be viewed by institution admins" ON institutions;
CREATE POLICY "Institutions can be viewed by institution admins" ON institutions
    FOR SELECT USING (id = get_user_institution_id() AND is_institution_admin());

DROP POLICY IF EXISTS "Institutions can be updated by institution admins" ON institutions;
CREATE POLICY "Institutions can be updated by institution admins" ON institutions
    FOR UPDATE USING (id = get_user_institution_id() AND is_institution_admin());

-- Políticas para USERS
-- Los usuarios pueden ver otros usuarios de su institución
DROP POLICY IF EXISTS "Users can view institution users" ON users;
CREATE POLICY "Users can view institution users" ON users
    FOR SELECT USING (institution_id = get_user_institution_id());

-- Solo los admins pueden crear/actualizar usuarios
DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para CAREERS
-- Todos los usuarios de la institución pueden ver las carreras
DROP POLICY IF EXISTS "Careers can be viewed by institution users" ON careers;
CREATE POLICY "Careers can be viewed by institution users" ON careers
    FOR SELECT USING (institution_id = get_user_institution_id());

-- Solo los admins pueden gestionar carreras
DROP POLICY IF EXISTS "Admins can manage careers" ON careers;
CREATE POLICY "Admins can manage careers" ON careers
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para CYCLES
-- Todos los usuarios de la institución pueden ver los ciclos
DROP POLICY IF EXISTS "Cycles can be viewed by institution users" ON cycles;
CREATE POLICY "Cycles can be viewed by institution users" ON cycles
    FOR SELECT USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar ciclos
DROP POLICY IF EXISTS "Admins can manage cycles" ON cycles;
CREATE POLICY "Admins can manage cycles" ON cycles
    FOR ALL USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para SUBJECTS
-- Todos los usuarios de la institución pueden ver las materias
DROP POLICY IF EXISTS "Subjects can be viewed by institution users" ON subjects;
CREATE POLICY "Subjects can be viewed by institution users" ON subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar materias
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
CREATE POLICY "Admins can manage subjects" ON subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para PROFESSOR_SUBJECTS
-- Los profesores pueden ver sus asignaciones
DROP POLICY IF EXISTS "Professors can view their subject assignments" ON professor_subjects;
CREATE POLICY "Professors can view their subject assignments" ON professor_subjects
    FOR SELECT USING (professor_id = auth.uid());

-- Los administradores pueden gestionar asignaciones de profesores
DROP POLICY IF EXISTS "Admins can manage professor subject assignments" ON professor_subjects;
CREATE POLICY "Admins can manage professor subject assignments" ON professor_subjects
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para STUDENTS
-- Los estudiantes pueden ver su propia información
DROP POLICY IF EXISTS "Students can view their own information" ON students;
CREATE POLICY "Students can view their own information" ON students
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden ver estudiantes de su institución
DROP POLICY IF EXISTS "Users can view institution students" ON students;
CREATE POLICY "Users can view institution students" ON students
    FOR SELECT USING (institution_id = get_user_institution_id());

-- Solo los admins pueden gestionar estudiantes
DROP POLICY IF EXISTS "Admins can manage students" ON students;
CREATE POLICY "Admins can manage students" ON students
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para ENROLLMENTS
-- Los estudiantes pueden ver sus inscripciones
DROP POLICY IF EXISTS "Students can view their enrollments" ON enrollments;
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

-- Los profesores pueden ver inscripciones de sus materias
DROP POLICY IF EXISTS "Professors can view enrollments for their subjects" ON enrollments;
CREATE POLICY "Professors can view enrollments for their subjects" ON enrollments
    FOR SELECT USING (
        subject_id IN (
            SELECT ps.subject_id FROM professor_subjects ps
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar inscripciones
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments" ON enrollments
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects_new s
            WHERE s.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para GRADES
-- Los estudiantes pueden ver sus calificaciones
DROP POLICY IF EXISTS "Students can view their grades" ON grades;
CREATE POLICY "Students can view their grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Los profesores pueden gestionar calificaciones de sus materias
DROP POLICY IF EXISTS "Professors can manage grades for their subjects" ON grades;
CREATE POLICY "Professors can manage grades for their subjects" ON grades
    FOR ALL USING (
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN professor_subjects ps ON e.subject_id = ps.subject_id
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Políticas para CORRELATIVES
-- Todos los usuarios pueden ver correlatividades de su institución
DROP POLICY IF EXISTS "Users can view institution correlatives" ON correlatives;
CREATE POLICY "Users can view institution correlatives" ON correlatives
    FOR SELECT USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar correlatividades
DROP POLICY IF EXISTS "Admins can manage correlatives" ON correlatives;
CREATE POLICY "Admins can manage correlatives" ON correlatives
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );
