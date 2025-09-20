-- Arreglar el trigger para evitar conflictos
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Actualizar el trigger para manejar conflictos
-- ==============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear entrada si no existe ya (para evitar duplicados)
    -- Usar ON CONFLICT para manejar casos donde ya existe
    INSERT INTO users (
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
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE((NEW.raw_user_meta_data->>'institution_id')::UUID, NULL),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        institution_id = COALESCE(EXCLUDED.institution_id, users.institution_id),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 2: Actualizar función de registro para pasar institution_id
-- ==============================================

CREATE OR REPLACE FUNCTION complete_institution_registration(
    -- Datos de la institución
    p_institution_name VARCHAR(255),
    p_institution_email VARCHAR(255),
    p_institution_phone VARCHAR(20),
    p_institution_address TEXT,
    -- Datos del usuario administrador
    p_user_email VARCHAR(255),
    p_user_first_name VARCHAR(100),
    p_user_last_name VARCHAR(100),
    p_user_phone VARCHAR(20),
    p_user_password TEXT
)
RETURNS JSON AS $$
DECLARE
    new_institution_id UUID;
    result JSON;
BEGIN
    -- Verificar que el email de usuario no exista
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
    
    -- Crear la institución PRIMERO
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
    
    -- Retornar resultado exitoso con institution_id
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
-- PASO 3: Simplificar función de vinculación
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
    
    -- Actualizar la entrada en users con el ID real de Auth y institution_id
    UPDATE users 
    SET id = auth_user_id,
        institution_id = p_institution_id,
        role = 'admin',
        updated_at = NOW()
    WHERE email = p_user_email;
    
    -- Si no existe el usuario, crearlo
    IF NOT FOUND THEN
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
        WHERE id = auth_user_id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuario vinculado exitosamente'
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 4: Verificar estado actual
-- ==============================================

SELECT 'ESTADO ACTUAL:' as info;
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
