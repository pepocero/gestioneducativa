-- Políticas RLS (Row Level Security) para el Sistema de Gestión Educativa
-- Este script debe ejecutarse después del schema.sql en Supabase SQL Editor

-- Habilitar RLS en todas las tablas
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlatives ENABLE ROW LEVEL SECURITY;

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

-- Función helper para verificar si el usuario es estudiante
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'student' 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para INSTITUTIONS
-- Solo los admins pueden ver y modificar su propia institución
CREATE POLICY "Institutions can be viewed by institution admins" ON institutions
    FOR SELECT USING (id = get_user_institution_id() AND is_institution_admin());

CREATE POLICY "Institutions can be updated by institution admins" ON institutions
    FOR UPDATE USING (id = get_user_institution_id() AND is_institution_admin());

-- Políticas para USERS
-- Los usuarios pueden ver otros usuarios de su institución
CREATE POLICY "Users can view institution users" ON users
    FOR SELECT USING (institution_id = get_user_institution_id());

-- Solo los admins pueden crear/actualizar usuarios
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para CAREERS
-- Todos los usuarios de la institución pueden ver las carreras
CREATE POLICY "Careers can be viewed by institution users" ON careers
    FOR SELECT USING (institution_id = get_user_institution_id());

-- Solo los admins pueden gestionar carreras
CREATE POLICY "Admins can manage careers" ON careers
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para CYCLES
-- Todos los usuarios de la institución pueden ver los ciclos
CREATE POLICY "Cycles can be viewed by institution users" ON cycles
    FOR SELECT USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar ciclos
CREATE POLICY "Admins can manage cycles" ON cycles
    FOR ALL USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para SUBJECTS
-- Todos los usuarios de la institución pueden ver las materias
CREATE POLICY "Subjects can be viewed by institution users" ON subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar materias
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
CREATE POLICY "Professors can view their subjects" ON professor_subjects
    FOR SELECT USING (
        professor_id = auth.uid() OR
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar asignaciones de profesores
CREATE POLICY "Admins can manage professor subjects" ON professor_subjects
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
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (
        user_id = auth.uid() OR
        institution_id = get_user_institution_id()
    );

-- Solo los admins pueden gestionar estudiantes
CREATE POLICY "Admins can manage students" ON students
    FOR ALL USING (institution_id = get_user_institution_id() AND is_institution_admin());

-- Políticas para ENROLLMENTS
-- Los estudiantes pueden ver sus inscripciones
CREATE POLICY "Students can view their enrollments" ON enrollments
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        ) OR
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Los profesores pueden ver inscripciones de sus materias
CREATE POLICY "Professors can view enrollments for their subjects" ON enrollments
    FOR SELECT USING (
        subject_id IN (
            SELECT ps.subject_id FROM professor_subjects ps
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Solo los admins pueden gestionar inscripciones
CREATE POLICY "Admins can manage enrollments" ON enrollments
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Políticas para GRADES
-- Los estudiantes pueden ver sus calificaciones
CREATE POLICY "Students can view their grades" ON grades
    FOR SELECT USING (
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Los profesores pueden gestionar calificaciones de sus materias
CREATE POLICY "Professors can manage grades for their subjects" ON grades
    FOR ALL USING (
        professor_id = auth.uid() AND
        enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN professor_subjects ps ON e.subject_id = ps.subject_id
            WHERE ps.professor_id = auth.uid()
        )
    );

-- Los admins pueden ver todas las calificaciones de su institución
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

-- Políticas para CORRELATIVES
-- Todos los usuarios de la institución pueden ver correlatividades
CREATE POLICY "Correlatives can be viewed by institution users" ON correlatives
    FOR SELECT USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        )
    );

-- Solo los admins pueden gestionar correlatividades
CREATE POLICY "Admins can manage correlatives" ON correlatives
    FOR ALL USING (
        subject_id IN (
            SELECT s.id FROM subjects s
            JOIN cycles c ON s.cycle_id = c.id
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );
