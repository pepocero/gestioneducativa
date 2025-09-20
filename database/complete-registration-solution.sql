-- Solución DEFINITIVA: Registro completo de institución + usuario
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Revertir cambios del esquema (institution_id debe ser NOT NULL)
-- ==============================================

-- Hacer institution_id obligatorio nuevamente
ALTER TABLE users ALTER COLUMN institution_id SET NOT NULL;

-- ==============================================
-- PASO 2: Crear función para registro completo
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
    new_user_id UUID;
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
    
    -- Crear el usuario en Supabase Auth
    -- NOTA: Esto debe hacerse desde el frontend, no desde SQL
    -- Por ahora solo creamos la entrada en la tabla users
    
    -- Generar un UUID temporal para el usuario
    new_user_id := uuid_generate_v4();
    
    -- Crear entrada en tabla users (se vinculará después del registro en Auth)
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
    ) VALUES (
        new_user_id,
        new_institution_id,
        p_user_email,
        'admin',
        p_user_first_name,
        p_user_last_name,
        p_user_phone,
        NOW(),
        NOW()
    );
    
    -- Retornar resultado exitoso
    RETURN json_build_object(
        'success', true,
        'institution_id', new_institution_id,
        'user_id', new_user_id,
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
    
    -- Actualizar la entrada en users con el ID real de Auth
    UPDATE users 
    SET id = auth_user_id,
        updated_at = NOW()
    WHERE email = p_user_email AND institution_id = p_institution_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No se encontró el usuario para vincular'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuario vinculado exitosamente'
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 4: Actualizar trigger para usuarios nuevos
-- ==============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear entrada si no existe ya (para evitar duplicados)
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
        NULL, -- Será asignado cuando se vincule a una institución
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 5: Actualizar políticas RLS para manejar institution_id NOT NULL
-- ==============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can update their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can delete their institution" ON institutions;

-- Crear nuevas políticas
CREATE POLICY "Users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their institution" ON institutions
    FOR SELECT USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their institution" ON institutions
    FOR UPDATE USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their institution" ON institutions
    FOR DELETE USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 6: Limpiar datos existentes problemáticos
-- ==============================================

-- Eliminar usuarios sin institución (datos de prueba)
DELETE FROM users WHERE institution_id IS NULL;

-- ==============================================
-- PASO 7: Verificar resultado
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
