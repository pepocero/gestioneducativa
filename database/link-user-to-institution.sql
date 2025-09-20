-- Script simple para vincular usuario a institución usando Service Role
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Verificar estado actual
-- ==============================================

-- Ver instituciones existentes
SELECT 'INSTITUCIONES:' as info, id, name, email, created_at FROM institutions ORDER BY created_at DESC;

-- Ver usuarios existentes
SELECT 'USUARIOS:' as info, id, email, institution_id, role FROM users ORDER BY created_at DESC;

-- ==============================================
-- PASO 2: Vincular usuario actual a la institución más reciente
-- ==============================================

-- Obtener el ID del usuario actual (esto se ejecutará con permisos de service role)
DO $$
DECLARE
    current_user_id UUID;
    latest_institution_id UUID;
    user_email TEXT;
BEGIN
    -- Obtener el ID del usuario actual de la sesión
    current_user_id := auth.uid();
    
    -- Obtener la institución más reciente
    SELECT id INTO latest_institution_id 
    FROM institutions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Obtener el email del usuario
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    RAISE NOTICE 'Usuario actual: %', current_user_id;
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Institución más reciente: %', latest_institution_id;
    
    -- Verificar si el usuario ya existe
    IF EXISTS (SELECT 1 FROM users WHERE id = current_user_id) THEN
        -- Actualizar institución existente
        UPDATE users 
        SET institution_id = latest_institution_id,
            role = 'admin'
        WHERE id = current_user_id;
        
        RAISE NOTICE 'Usuario actualizado con institución: %', latest_institution_id;
    ELSE
        -- Crear nuevo usuario
        INSERT INTO users (id, institution_id, email, role, first_name, last_name)
        VALUES (
            current_user_id,
            latest_institution_id,
            user_email,
            'admin',
            'Admin',
            'User'
        );
        
        RAISE NOTICE 'Usuario creado con institución: %', latest_institution_id;
    END IF;
END $$;

-- ==============================================
-- PASO 3: Verificar resultado
-- ==============================================

-- Verificar vinculación
SELECT 'RESULTADO:' as info;
SELECT 
    u.id,
    u.email,
    u.institution_id,
    u.role,
    i.name as institution_name
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
WHERE u.id = auth.uid();
