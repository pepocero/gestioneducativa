-- Script para corregir recursión infinita en políticas de USERS
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas problemáticas de users
DROP POLICY IF EXISTS "Users can view institution users" ON users;
DROP POLICY IF EXISTS "Admins can create users in their institution" ON users;
DROP POLICY IF EXISTS "Admins can delete users from their institution" ON users;

-- Crear políticas corregidas para USERS
-- Los usuarios pueden ver otros usuarios de su institución
CREATE POLICY "Users can view institution users" ON users
    FOR SELECT USING (
        institution_id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- Solo los admins pueden crear usuarios en su institución
CREATE POLICY "Admins can create users in their institution" ON users
    FOR INSERT WITH CHECK (
        institution_id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
            LIMIT 1
        )
    );

-- Solo los admins pueden eliminar usuarios de su institución
CREATE POLICY "Admins can delete users from their institution" ON users
    FOR DELETE USING (
        institution_id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
            LIMIT 1
        )
    );

-- Verificar que las políticas estén correctas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
