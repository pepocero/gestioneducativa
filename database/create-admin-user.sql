-- Script para crear un usuario administrador de ejemplo
-- Ejecutar después de registrar una institución a través de la interfaz web

-- NOTA: Este script es solo para desarrollo/testing
-- En producción, los usuarios deben registrarse a través de la interfaz

-- Obtener el ID de la institución (reemplazar con el ID real)
-- SELECT id FROM institutions WHERE email = 'info@utn.edu.ar';

-- Insertar usuario administrador de ejemplo
-- IMPORTANTE: El ID del usuario debe coincidir con el ID de Supabase Auth
INSERT INTO users (
    id, 
    institution_id, 
    email, 
    role, 
    first_name, 
    last_name, 
    phone
) VALUES (
    -- Reemplazar con el ID real del usuario de Supabase Auth
    '11111111-1111-1111-1111-111111111111',
    -- Reemplazar con el ID real de la institución
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@utn.edu.ar',
    'admin',
    'Juan',
    'Administrador',
    '+54-11-1234-5678'
) ON CONFLICT (id) DO UPDATE SET
    institution_id = EXCLUDED.institution_id,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone;
