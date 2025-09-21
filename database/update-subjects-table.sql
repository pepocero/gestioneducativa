-- Script para agregar la columna career_id a la tabla subjects_new
-- y actualizar las materias existentes

-- 1. Agregar la columna career_id a la tabla subjects_new
ALTER TABLE public.subjects_new 
ADD COLUMN IF NOT EXISTS career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE;

-- 2. Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subjects_new_career_id ON public.subjects_new(career_id);

-- 3. Actualizar materias existentes para asignarles una carrera por defecto
-- Esto asigna las materias a la primera carrera disponible de la misma institución
UPDATE public.subjects_new 
SET career_id = (
    SELECT c.id 
    FROM public.careers c 
    WHERE c.institution_id = subjects_new.institution_id 
    ORDER BY c.created_at ASC 
    LIMIT 1
)
WHERE career_id IS NULL;

-- 4. Hacer la columna career_id NOT NULL después de asignar valores
ALTER TABLE public.subjects_new 
ALTER COLUMN career_id SET NOT NULL;

-- 5. Actualizar las políticas RLS para incluir career_id
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON public.subjects_new;
DROP POLICY IF EXISTS "Users can create subjects in their institution" ON public.subjects_new;
DROP POLICY IF EXISTS "Users can update subjects in their institution" ON public.subjects_new;
DROP POLICY IF EXISTS "Users can delete subjects in their institution" ON public.subjects_new;

-- Crear nuevas políticas que incluyan career_id
CREATE POLICY "Users can view subjects from their institution" ON public.subjects_new
    FOR SELECT
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create subjects in their institution" ON public.subjects_new
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

CREATE POLICY "Users can update subjects in their institution" ON public.subjects_new
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

CREATE POLICY "Users can delete subjects in their institution" ON public.subjects_new
    FOR DELETE
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

-- 6. Mensaje de confirmación
SELECT 'Tabla subjects_new actualizada con career_id' as status;
