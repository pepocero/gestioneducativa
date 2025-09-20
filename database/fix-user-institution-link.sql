-- Script para verificar y corregir la vinculación de usuarios a instituciones
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Verificar el estado actual
-- ==============================================

-- Verificar qué instituciones existen
SELECT 'INSTITUCIONES EXISTENTES:' as info;
SELECT id, name, email, created_at FROM institutions ORDER BY created_at;

-- Verificar qué usuarios existen en la tabla users
SELECT 'USUARIOS EN TABLA USERS:' as info;
SELECT id, email, institution_id, role, first_name, last_name FROM users ORDER BY created_at;

-- Verificar el usuario actual autenticado
SELECT 'USUARIO ACTUAL AUTENTICADO:' as info;
SELECT auth.uid() as current_user_id;

-- ==============================================
-- PASO 2: Vincular el usuario actual a la institución más reciente
-- ==============================================

-- Obtener el ID del usuario actual
DO $$
DECLARE
    current_user_id UUID;
    latest_institution_id UUID;
BEGIN
    -- Obtener el ID del usuario actual
    SELECT auth.uid() INTO current_user_id;
    
    -- Obtener la institución más reciente
    SELECT id INTO latest_institution_id 
    FROM institutions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Mostrar información
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    RAISE NOTICE 'Institución más reciente: %', latest_institution_id;
    
    -- Verificar si el usuario ya existe en la tabla users
    IF EXISTS (SELECT 1 FROM users WHERE id = current_user_id) THEN
        RAISE NOTICE 'Usuario ya existe en tabla users';
        
        -- Actualizar la institución del usuario
        UPDATE users 
        SET institution_id = latest_institution_id,
            role = 'admin'
        WHERE id = current_user_id;
        
        RAISE NOTICE 'Usuario vinculado a institución: %', latest_institution_id;
    ELSE
        RAISE NOTICE 'Usuario no existe en tabla users, creándolo...';
        
        -- Crear el usuario en la tabla users
        INSERT INTO users (id, institution_id, email, role, first_name, last_name)
        VALUES (
            current_user_id,
            latest_institution_id,
            (SELECT email FROM auth.users WHERE id = current_user_id),
            'admin',
            COALESCE((SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = current_user_id), ''),
            COALESCE((SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = current_user_id), '')
        );
        
        RAISE NOTICE 'Usuario creado y vinculado a institución: %', latest_institution_id;
    END IF;
END $$;

-- ==============================================
-- PASO 3: Verificar el resultado
-- ==============================================

-- Verificar que el usuario esté vinculado correctamente
SELECT 'VERIFICACIÓN FINAL:' as info;
SELECT 
    u.id,
    u.email,
    u.institution_id,
    u.role,
    i.name as institution_name
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
WHERE u.id = auth.uid();

-- Verificar que las políticas funcionen
SELECT 'INSTITUCIONES VISIBLES PARA EL USUARIO:' as info;
SELECT id, name, email FROM institutions;
