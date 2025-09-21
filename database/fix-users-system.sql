-- Script para implementar correctamente el sistema de usuarios
-- Este script crea la tabla users y las políticas RLS necesarias

-- 1. Crear la tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'professor', 'student')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para users
-- Política para SELECT: Los usuarios pueden ver su propio perfil y otros usuarios de su institución
CREATE POLICY "Users can view profiles from their institution" ON public.users
    FOR SELECT
    USING (
        auth.uid() = auth_user_id OR 
        institution_id IN (
            SELECT institution_id 
            FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política para INSERT: Los usuarios pueden crear su propio perfil
CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Política para UPDATE: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Política para DELETE: Solo admins pueden eliminar usuarios de su institución
CREATE POLICY "Admins can delete users from their institution" ON public.users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.auth_user_id = auth.uid()
            AND u.role = 'admin'
            AND u.institution_id = users.institution_id
        )
    );

-- 4. Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear un registro en la tabla users cuando se crea un usuario en auth.users
    INSERT INTO public.users (
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
        'admin', -- Rol por defecto
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin'),
        NEW.raw_user_meta_data->>'phone',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Crear función para obtener el usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS TABLE (
    id UUID,
    institution_id UUID,
    email TEXT,
    role TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
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
    FROM public.users u
    WHERE u.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear función para obtener la institución del usuario
CREATE OR REPLACE FUNCTION public.get_user_institution()
RETURNS UUID AS $$
DECLARE
    user_institution_id UUID;
BEGIN
    SELECT institution_id INTO user_institution_id
    FROM public.users
    WHERE auth_user_id = auth.uid();
    
    RETURN user_institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Crear función para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin_of_institution(institution_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
        AND institution_id = institution_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON public.users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 10. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
