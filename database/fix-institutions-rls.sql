-- Fix para políticas RLS de la tabla institutions
-- Este script debe ejecutarse en Supabase SQL Editor para corregir el problema de creación de instituciones

-- Política para permitir que usuarios autenticados creen instituciones
-- Esto es necesario para el flujo de registro donde se crea la primera institución
CREATE POLICY "Authenticated users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Alternativamente, si queremos ser más restrictivos y solo permitir
-- que usuarios sin institución asignada creen instituciones, usar esta política:
-- CREATE POLICY "Users without institution can create institutions" ON institutions
--     FOR INSERT WITH CHECK (
--         auth.uid() IS NOT NULL AND 
--         NOT EXISTS (
--             SELECT 1 FROM users WHERE id = auth.uid() AND institution_id IS NOT NULL
--         )
--     );

-- También necesitamos una política para que los admins puedan ver todas las instituciones
-- (no solo la suya) para el caso de super-admins que gestionan múltiples instituciones
CREATE POLICY "Admins can view all institutions" ON institutions
    FOR SELECT USING (is_institution_admin());
