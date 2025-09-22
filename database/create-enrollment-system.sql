-- Script para crear el sistema de inscripciones
-- Basado en mejores prácticas de sistemas académicos

-- 1. Crear tabla de inscripciones a carreras
CREATE TABLE IF NOT EXISTS public.career_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')) NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción de unicidad: un estudiante solo puede estar inscrito una vez por carrera por año académico
    UNIQUE(student_id, career_id, academic_year, semester)
);

-- 2. Crear tabla de inscripciones a materias
CREATE TABLE IF NOT EXISTS public.subject_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects_new(id) ON DELETE CASCADE NOT NULL,
    career_enrollment_id UUID REFERENCES public.career_enrollments(id) ON DELETE CASCADE NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'failed', 'dropped', 'incomplete')) NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    final_grade DECIMAL(3,2) CHECK (final_grade >= 0 AND final_grade <= 10),
    attendance_percentage DECIMAL(5,2) CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción de unicidad: un estudiante solo puede estar inscrito una vez por materia por semestre
    UNIQUE(student_id, subject_id, academic_year, semester)
);

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_career_enrollments_student_id ON public.career_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_career_enrollments_career_id ON public.career_enrollments(career_id);
CREATE INDEX IF NOT EXISTS idx_career_enrollments_status ON public.career_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_career_enrollments_academic_year ON public.career_enrollments(academic_year);

CREATE INDEX IF NOT EXISTS idx_subject_enrollments_student_id ON public.subject_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_subject_id ON public.subject_enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_career_enrollment_id ON public.subject_enrollments(career_enrollment_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_status ON public.subject_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_academic_year ON public.subject_enrollments(academic_year);

-- 4. Habilitar RLS en las tablas
ALTER TABLE public.career_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_enrollments ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS para career_enrollments
CREATE POLICY "Users can view career enrollments from their institution" ON public.career_enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = career_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create career enrollments in their institution" ON public.career_enrollments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = career_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.careers c
            JOIN public.users u ON u.institution_id = c.institution_id
            WHERE c.id = career_enrollments.career_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update career enrollments in their institution" ON public.career_enrollments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = career_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete career enrollments in their institution" ON public.career_enrollments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = career_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- 6. Crear políticas RLS para subject_enrollments
CREATE POLICY "Users can view subject enrollments from their institution" ON public.subject_enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = subject_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create subject enrollments in their institution" ON public.subject_enrollments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = subject_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.subjects_new sub
            JOIN public.users u ON u.institution_id = sub.institution_id
            WHERE sub.id = subject_enrollments.subject_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update subject enrollments in their institution" ON public.subject_enrollments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = subject_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subject enrollments in their institution" ON public.subject_enrollments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.users u ON u.institution_id = s.institution_id
            WHERE s.id = subject_enrollments.student_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- 7. Crear funciones para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_career_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_subject_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_career_enrollments_updated_at ON public.career_enrollments;
CREATE TRIGGER update_career_enrollments_updated_at
    BEFORE UPDATE ON public.career_enrollments
    FOR EACH ROW EXECUTE FUNCTION public.update_career_enrollments_updated_at();

DROP TRIGGER IF EXISTS update_subject_enrollments_updated_at ON public.subject_enrollments;
CREATE TRIGGER update_subject_enrollments_updated_at
    BEFORE UPDATE ON public.subject_enrollments
    FOR EACH ROW EXECUTE FUNCTION public.update_subject_enrollments_updated_at();

-- 9. Mensaje de confirmación
SELECT 'Sistema de inscripciones creado exitosamente' as status;
