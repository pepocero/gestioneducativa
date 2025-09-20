-- Solución DEFINITIVA: Desactivar trigger problemático y usar flujo manual
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Desactivar el trigger problemático
-- ==============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ==============================================
-- PASO 2: Crear función simplificada para registro completo
-- ==============================================

CREATE OR REPLACE FUNCTION complete_institution_and_user_registration(
    -- Datos de la institución
    p_institution_name VARCHAR(255),
    p_institution_email VARCHAR(255),
    p_institution_phone VARCHAR(20),
    p_institution_address TEXT,
    -- Datos del usuario administrador
    p_user_email VARCHAR(255),
    p_user_first_name VARCHAR(100),
    p_user_last_name VARCHAR(100),
    p_user_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    new_institution_id UUID;
    result JSON;
BEGIN
    -- Verificar que el email de usuario no exista en Auth
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_user_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El email ya está registrado'
        );
    END IF;
    
    -- Verificar que el email de institución no exista
    IF EXISTS (SELECT 1 FROM institutions WHERE email = p_institution_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El email de la institución ya está registrado'
        );
    END IF;
    
    -- Crear la institución
    INSERT INTO institutions (
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
    ) VALUES (
        p_institution_name,
        p_institution_email,
        p_institution_phone,
        p_institution_address,
        NOW(),
        NOW()
    ) RETURNING id INTO new_institution_id;
    
    -- Retornar resultado exitoso
    RETURN json_build_object(
        'success', true,
        'institution_id', new_institution_id,
        'message', 'Institución creada exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, hacer rollback automático
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 3: Crear función para vincular usuario después del registro en Auth
-- ==============================================

CREATE OR REPLACE FUNCTION link_user_after_auth_registration(
    p_user_email VARCHAR(255),
    p_institution_id UUID
)
RETURNS JSON AS $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Obtener el ID del usuario de Auth
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = p_user_email;
    
    IF auth_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no encontrado en Auth'
        );
    END IF;
    
    -- Verificar que la institución existe
    IF NOT EXISTS (SELECT 1 FROM institutions WHERE id = p_institution_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Institución no encontrada'
        );
    END IF;
    
    -- Crear entrada en users (sin trigger)
    INSERT INTO users (
        id,
        institution_id,
        email,
        role,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
    )
    SELECT 
        auth_user_id,
        p_institution_id,
        email,
        'admin',
        COALESCE(raw_user_meta_data->>'first_name', ''),
        COALESCE(raw_user_meta_data->>'last_name', ''),
        COALESCE(raw_user_meta_data->>'phone', NULL),
        NOW(),
        NOW()
    FROM auth.users 
    WHERE id = auth_user_id
    ON CONFLICT (id) DO UPDATE SET
        institution_id = p_institution_id,
        email = EXCLUDED.email,
        role = 'admin',
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuario vinculado exitosamente'
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 4: Limpiar datos huérfanos existentes
-- ==============================================

-- Eliminar usuarios sin Auth
DELETE FROM users WHERE id NOT IN (SELECT id FROM auth.users);

-- Eliminar instituciones sin usuarios
DELETE FROM institutions WHERE id NOT IN (
    SELECT DISTINCT institution_id FROM users WHERE institution_id IS NOT NULL
);

-- ==============================================
-- PASO 5: Verificar estado final
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

SELECT 'INSTITUCIONES:' as info;
SELECT id, name, email, created_at 
FROM institutions 
ORDER BY created_at DESC;
