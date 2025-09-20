-- Solución PERMANENTE para Multi-Tenancy con Supabase
-- Este script implementa triggers automáticos y funciones que funcionan para TODOS los usuarios
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Crear función para vincular usuario a institución
-- ==============================================

CREATE OR REPLACE FUNCTION link_user_to_institution(institution_id UUID)
RETURNS VOID AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    -- Obtener el usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Obtener datos del usuario de auth.users
    SELECT 
        email,
        COALESCE(raw_user_meta_data->>'first_name', ''),
        COALESCE(raw_user_meta_data->>'last_name', '')
    INTO user_email, user_first_name, user_last_name
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Verificar si el usuario ya existe en la tabla users
    IF EXISTS (SELECT 1 FROM users WHERE id = current_user_id) THEN
        -- Actualizar institución existente
        UPDATE users 
        SET institution_id = link_user_to_institution.institution_id,
            role = 'admin',
            updated_at = NOW()
        WHERE id = current_user_id;
    ELSE
        -- Crear nuevo usuario
        INSERT INTO users (
            id, 
            institution_id, 
            email, 
            role, 
            first_name, 
            last_name,
            created_at,
            updated_at
        )
        VALUES (
            current_user_id,
            link_user_to_institution.institution_id,
            user_email,
            'admin',
            user_first_name,
            user_last_name,
            NOW(),
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Usuario % vinculado a institución %', current_user_id, institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 2: Crear trigger para crear usuario automáticamente al registrarse
-- ==============================================

-- Función que se ejecuta cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear entrada en la tabla users con datos básicos
    INSERT INTO users (
        id,
        email,
        role,
        first_name,
        last_name,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        'student', -- Rol por defecto
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- PASO 3: Crear función para obtener institución del usuario
-- ==============================================

CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 4: Crear función para verificar si es admin
-- ==============================================

CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin' 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 5: Vincular usuario actual a institución existente (solo para el usuario actual)
-- ==============================================

-- Ejecutar solo si el usuario actual no está vinculado
DO $$
DECLARE
    current_user_id UUID;
    latest_institution_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    -- Solo proceder si hay un usuario autenticado
    IF current_user_id IS NOT NULL THEN
        -- Verificar si el usuario ya está vinculado
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_user_id AND institution_id IS NOT NULL
        ) THEN
            -- Obtener la institución más reciente
            SELECT id INTO latest_institution_id 
            FROM institutions 
            ORDER BY created_at DESC 
            LIMIT 1;
            
            -- Vincular usuario a institución si existe
            IF latest_institution_id IS NOT NULL THEN
                PERFORM link_user_to_institution(latest_institution_id);
                RAISE NOTICE 'Usuario vinculado a institución existente: %', latest_institution_id;
            END IF;
        END IF;
    END IF;
END $$;

-- ==============================================
-- PASO 6: Verificar que todo funciona
-- ==============================================

-- Verificar usuarios vinculados
SELECT 'USUARIOS VINCULADOS:' as info;
SELECT 
    u.id,
    u.email,
    u.institution_id,
    u.role,
    i.name as institution_name
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
ORDER BY u.created_at DESC;

-- Verificar que las funciones funcionan
SELECT 'VERIFICACIÓN DE FUNCIONES:' as info;
SELECT 
    auth.uid() as current_user_id,
    get_user_institution_id() as user_institution_id,
    is_user_admin() as is_admin;
