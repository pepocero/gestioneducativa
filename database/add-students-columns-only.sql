-- Script mínimo para agregar solo las columnas faltantes a la tabla students
-- Sin tocar políticas RLS existentes

-- 1. Agregar solo las columnas que faltan
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

-- 2. Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON public.students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_career_id ON public.students(career_id);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON public.students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- 3. Habilitar RLS solo si no está habilitado
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS solo si no existen
DO $$ 
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Users can view students from their institution') THEN
        CREATE POLICY "Users can view students from their institution" ON public.students
            FOR SELECT
            USING (
                institution_id IN (
                    SELECT institution_id 
                    FROM public.users 
                    WHERE auth_user_id = auth.uid()
                )
            );
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Users can create students in their institution') THEN
        CREATE POLICY "Users can create students in their institution" ON public.students
            FOR INSERT
            WITH CHECK (
                institution_id IN (
                    SELECT institution_id 
                    FROM public.users 
                    WHERE auth_user_id = auth.uid()
                )
            );
    END IF;
    
    -- Política para UPDATE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Users can update students in their institution') THEN
        CREATE POLICY "Users can update students in their institution" ON public.students
            FOR UPDATE
            USING (
                institution_id IN (
                    SELECT institution_id 
                    FROM public.users 
                    WHERE auth_user_id = auth.uid()
                )
            );
    END IF;
    
    -- Política para DELETE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Users can delete students in their institution') THEN
        CREATE POLICY "Users can delete students in their institution" ON public.students
            FOR DELETE
            USING (
                institution_id IN (
                    SELECT institution_id 
                    FROM public.users 
                    WHERE auth_user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 5. Mensaje de confirmación
SELECT 'Columnas agregadas a la tabla students' as status;
