-- Solución DEFINITIVA para el problema de registro de usuarios
-- Modifica el esquema para permitir usuarios sin institución inicialmente
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Modificar el esquema para permitir usuarios sin institución
-- ==============================================

-- Hacer institution_id opcional temporalmente
ALTER TABLE users ALTER COLUMN institution_id DROP NOT NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN users.institution_id IS 'Puede ser NULL temporalmente hasta que el usuario cree o se una a una institución';

-- ==============================================
-- PASO 2: Crear función para manejar registro completo
-- ==============================================

CREATE OR REPLACE FUNCTION handle_user_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear entrada en la tabla users con institution_id NULL inicialmente
    INSERT INTO users (
        id,
        email,
        role,
        first_name,
        last_name,
        phone,
        institution_id, -- NULL inicialmente
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
        NULL, -- institution_id será asignado cuando cree una institución
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
    FOR EACH ROW EXECUTE FUNCTION handle_user_registration();

-- ==============================================
-- PASO 3: Actualizar función de vinculación
-- ==============================================

CREATE OR REPLACE FUNCTION link_user_to_institution(institution_id UUID)
RETURNS VOID AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Actualizar usuario existente
    UPDATE users 
    SET institution_id = link_user_to_institution.institution_id,
        role = 'admin',
        updated_at = NOW()
    WHERE id = current_user_id;
    
    -- Si no existe el usuario, crearlo (caso edge)
    IF NOT FOUND THEN
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
        SELECT 
            current_user_id,
            link_user_to_institution.institution_id,
            email,
            'admin',
            COALESCE(raw_user_meta_data->>'first_name', ''),
            COALESCE(raw_user_meta_data->>'last_name', ''),
            NOW(),
            NOW()
        FROM auth.users 
        WHERE id = current_user_id;
    END IF;
    
    RAISE NOTICE 'Usuario % vinculado a institución %', current_user_id, institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PASO 4: Actualizar políticas RLS para manejar institution_id NULL
-- ==============================================

-- Eliminar políticas existentes de institutions
DROP POLICY IF EXISTS "Users can create institutions" ON institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can update their institution" ON institutions;
DROP POLICY IF EXISTS "Admins can delete their institution" ON institutions;

-- Crear nuevas políticas que manejen institution_id NULL
CREATE POLICY "Users can create institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their institution" ON institutions
    FOR SELECT USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND institution_id IS NOT NULL
        )
    );

CREATE POLICY "Admins can update their institution" ON institutions
    FOR UPDATE USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND institution_id IS NOT NULL AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their institution" ON institutions
    FOR DELETE USING (
        id = (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid() AND institution_id IS NOT NULL AND role = 'admin'
        )
    );

-- ==============================================
-- PASO 5: Vincular usuario actual a institución existente
-- ==============================================

DO $$
DECLARE
    current_user_id UUID;
    latest_institution_id UUID;
BEGIN
    current_user_id := auth.uid();
    
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
-- PASO 6: Verificar resultado
-- ==============================================

-- Verificar usuarios y sus instituciones
SELECT 'ESTADO ACTUAL:' as info;
SELECT 
    u.id,
    u.email,
    u.institution_id,
    u.role,
    i.name as institution_name
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
ORDER BY u.created_at DESC;
