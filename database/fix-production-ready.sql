-- Script corregido para implementar sistema completo de usuarios e instituciones
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar estructura actual de la tabla users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Si la tabla users existe pero no tiene auth_user_id, agregarla
DO $$
BEGIN
    -- Verificar si la columna auth_user_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'auth_user_id'
    ) THEN
        -- Agregar la columna auth_user_id
        ALTER TABLE users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Crear índice para la nueva columna
        CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
        
        RAISE NOTICE 'Columna auth_user_id agregada a la tabla users';
    ELSE
        RAISE NOTICE 'La columna auth_user_id ya existe en la tabla users';
    END IF;
END $$;

-- 3. Verificar si existen otras columnas necesarias y agregarlas si no existen
DO $$
BEGIN
    -- Verificar y agregar institution_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'institution_id'
    ) THEN
        ALTER TABLE users ADD COLUMN institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);
        RAISE NOTICE 'Columna institution_id agregada a la tabla users';
    END IF;

    -- Verificar y agregar role si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'student';
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        RAISE NOTICE 'Columna role agregada a la tabla users';
    END IF;

    -- Verificar y agregar is_active si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Columna is_active agregada a la tabla users';
    END IF;
END $$;

-- 4. Habilitar RLS en la tabla users (si no está habilitado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their institution" ON users;

-- 6. Crear políticas RLS para users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage users in their institution" ON users
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Función para crear usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear registro en tabla users cuando se registra en auth.users
    INSERT INTO users (
        auth_user_id,
        institution_id,
        email,
        role,
        first_name,
        last_name,
        phone,
        is_active
    ) VALUES (
        NEW.id,
        '00000000-0000-0000-0000-000000000000', -- Institución por defecto
        NEW.email,
        'admin', -- Por defecto admin para desarrollo
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        TRUE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Crear trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Función para obtener el usuario actual
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS TABLE (
    id UUID,
    institution_id UUID,
    email VARCHAR,
    role user_role,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.institution_id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active
    FROM users u
    WHERE u.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Función para verificar si el usuario es admin de su institución
CREATE OR REPLACE FUNCTION is_admin_of_institution(p_institution_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE auth_user_id = auth.uid() 
        AND institution_id = p_institution_id 
        AND role = 'admin'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Función para obtener la institución del usuario actual
CREATE OR REPLACE FUNCTION get_user_institution()
RETURNS UUID AS $$
DECLARE
    v_institution_id UUID;
BEGIN
    SELECT institution_id INTO v_institution_id
    FROM users 
    WHERE auth_user_id = auth.uid() AND is_active = TRUE;
    
    RETURN v_institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Actualizar políticas RLS para subjects_new con verificación real
DROP POLICY IF EXISTS "Authenticated users can manage subjects" ON subjects_new;
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON subjects_new;
DROP POLICY IF EXISTS "Admins can manage subjects in their institution" ON subjects_new;

CREATE POLICY "Users can view subjects from their institution" ON subjects_new
    FOR SELECT USING (
        institution_id = get_user_institution()
    );

CREATE POLICY "Admins can manage subjects in their institution" ON subjects_new
    FOR ALL USING (
        institution_id = get_user_institution() 
        AND is_admin_of_institution(institution_id)
    );

-- 13. Actualizar políticas RLS para cycle_subjects
DROP POLICY IF EXISTS "Authenticated users can manage cycle subjects" ON cycle_subjects;
DROP POLICY IF EXISTS "Users can view cycle subjects from their institution" ON cycle_subjects;
DROP POLICY IF EXISTS "Admins can manage cycle subjects in their institution" ON cycle_subjects;

CREATE POLICY "Users can view cycle subjects from their institution" ON cycle_subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution()
        )
    );

CREATE POLICY "Admins can manage cycle subjects in their institution" ON cycle_subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            WHERE ca.institution_id = get_user_institution()
        ) AND is_admin_of_institution(
            (SELECT ca.institution_id 
             FROM cycles c
             JOIN careers ca ON c.career_id = ca.id
             WHERE c.id = cycle_id)
        )
    );

-- 14. Actualizar políticas RLS para subject_prerequisites
DROP POLICY IF EXISTS "Authenticated users can manage prerequisites" ON subject_prerequisites;
DROP POLICY IF EXISTS "Users can view prerequisites from their institution" ON subject_prerequisites;
DROP POLICY IF EXISTS "Admins can manage prerequisites in their institution" ON subject_prerequisites;

CREATE POLICY "Users can view prerequisites from their institution" ON subject_prerequisites
    FOR SELECT USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id = get_user_institution()
        )
    );

CREATE POLICY "Admins can manage prerequisites in their institution" ON subject_prerequisites
    FOR ALL USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id = get_user_institution()
        ) AND is_admin_of_institution(
            (SELECT institution_id 
             FROM subjects_new 
             WHERE id = subject_id)
        )
    );

-- 15. Verificar que todo se creó correctamente
SELECT 'Users table structure updated' as status;
SELECT 'RLS policies updated' as status;
SELECT 'Functions created' as status;

-- 16. Mostrar estructura final de la tabla users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 17. Mostrar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'subjects_new', 'cycle_subjects', 'subject_prerequisites')
ORDER BY tablename, policyname;
