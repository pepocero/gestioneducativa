-- Script para actualizar la tabla students con todas las columnas necesarias
-- Manteniendo el multi-tenancy

-- 1. Agregar columnas faltantes a la tabla students
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS student_number TEXT,
ADD COLUMN IF NOT EXISTS enrollment_date DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS dni TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON public.students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_career_id ON public.students(career_id);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON public.students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- 3. Habilitar RLS en la tabla students si no está habilitado
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas RLS existentes si las hay
DROP POLICY IF EXISTS "Users can view students from their institution" ON public.students;
DROP POLICY IF EXISTS "Users can create students in their institution" ON public.students;
DROP POLICY IF EXISTS "Users can update students in their institution" ON public.students;
DROP POLICY IF EXISTS "Users can delete students in their institution" ON public.students;

-- 5. Crear políticas RLS para multi-tenancy
CREATE POLICY "Users can view students from their institution" ON public.students
    FOR SELECT
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create students in their institution" ON public.students
    FOR INSERT
    WITH CHECK (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
        AND career_id IN (
            SELECT id 
            FROM public.careers 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM public.users 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update students in their institution" ON public.students
    FOR UPDATE
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
        AND career_id IN (
            SELECT id 
            FROM public.careers 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM public.users 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete students in their institution" ON public.students
    FOR DELETE
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

-- 6. Agregar restricciones de unicidad (eliminar primero si existen)
DO $$ 
BEGIN
    -- Eliminar restricciones existentes si las hay
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_student_number_per_institution' 
               AND table_name = 'students') THEN
        ALTER TABLE public.students DROP CONSTRAINT unique_student_number_per_institution;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_email_per_institution' 
               AND table_name = 'students') THEN
        ALTER TABLE public.students DROP CONSTRAINT unique_email_per_institution;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_dni_per_institution' 
               AND table_name = 'students') THEN
        ALTER TABLE public.students DROP CONSTRAINT unique_dni_per_institution;
    END IF;
END $$;

-- Agregar las restricciones
ALTER TABLE public.students 
ADD CONSTRAINT unique_student_number_per_institution 
UNIQUE (student_number, institution_id);

ALTER TABLE public.students 
ADD CONSTRAINT unique_email_per_institution 
UNIQUE (email, institution_id);

ALTER TABLE public.students 
ADD CONSTRAINT unique_dni_per_institution 
UNIQUE (dni, institution_id);

-- 7. Agregar función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_students_updated_at();

-- 9. Mensaje de confirmación
SELECT 'Tabla students actualizada con todas las columnas necesarias' as status;
