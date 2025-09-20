-- Script para sincronizar usuarios existentes de Supabase Auth con la tabla users
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Crear función para sincronizar usuarios existentes
-- ==============================================

CREATE OR REPLACE FUNCTION sync_existing_auth_users()
RETURNS TABLE(
    auth_user_id UUID,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ,
    synced BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as auth_user_id,
        au.email::VARCHAR(255),
        COALESCE(au.raw_user_meta_data->>'first_name', '')::VARCHAR(100) as first_name,
        COALESCE(au.raw_user_meta_data->>'last_name', '')::VARCHAR(100) as last_name,
        COALESCE(au.raw_user_meta_data->>'phone', NULL)::VARCHAR(20) as phone,
        au.created_at,
        CASE WHEN u.id IS NOT NULL THEN true ELSE false END as synced
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.id
    WHERE au.email_confirmed_at IS NOT NULL  -- Solo usuarios confirmados
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 2: Crear función para insertar usuarios faltantes
-- ==============================================

CREATE OR REPLACE FUNCTION insert_missing_users()
RETURNS TABLE(
    inserted_count INTEGER,
    updated_count INTEGER
) AS $$
DECLARE
    inserted INTEGER := 0;
    updated INTEGER := 0;
BEGIN
    -- Insertar usuarios que existen en auth.users pero no en public.users
    WITH missing_users AS (
        SELECT 
            au.id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
            COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
            COALESCE(au.raw_user_meta_data->>'phone', NULL) as phone,
            COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role as role
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE u.id IS NULL 
        AND au.email_confirmed_at IS NOT NULL
    )
    INSERT INTO public.users (
        id,
        email,
        role,
        first_name,
        last_name,
        phone,
        institution_id,
        created_at,
        updated_at
    )
    SELECT 
        id,
        email,
        role,
        first_name,
        last_name,
        phone,
        NULL, -- institution_id será asignado cuando cree una institución
        NOW(),
        NOW()
    FROM missing_users
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    GET DIAGNOSTICS inserted = ROW_COUNT;
    
    RETURN QUERY SELECT inserted, updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 3: Ejecutar sincronización
-- ==============================================

-- Mostrar estado antes de sincronizar
SELECT 'ESTADO ANTES DE SINCRONIZAR:' as info;
SELECT * FROM sync_existing_auth_users();

-- Ejecutar sincronización
SELECT 'EJECUTANDO SINCRONIZACIÓN...' as info;
SELECT * FROM insert_missing_users();

-- Mostrar estado después de sincronizar
SELECT 'ESTADO DESPUÉS DE SINCRONIZAR:' as info;
SELECT * FROM sync_existing_auth_users();

-- ==============================================
-- PASO 4: Vincular usuarios a instituciones existentes
-- ==============================================

-- Vincular usuarios sin institución a la institución más reciente
DO $$
DECLARE
    user_record RECORD;
    latest_institution_id UUID;
BEGIN
    -- Obtener la institución más reciente
    SELECT id INTO latest_institution_id 
    FROM institutions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Vincular usuarios sin institución
    FOR user_record IN 
        SELECT id, email 
        FROM users 
        WHERE institution_id IS NULL
    LOOP
        -- Actualizar usuario para vincularlo a la institución
        UPDATE users 
        SET institution_id = latest_institution_id,
            role = 'admin',
            updated_at = NOW()
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Usuario % (%) vinculado a institución %', 
            user_record.email, user_record.id, latest_institution_id;
    END LOOP;
END $$;

-- ==============================================
-- PASO 5: Verificar resultado final
-- ==============================================

SELECT 'ESTADO FINAL:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.institution_id,
    u.role,
    i.name as institution_name,
    u.created_at
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
ORDER BY u.created_at DESC;
