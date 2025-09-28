-- Script para solucionar el problema del usuario demo con instituciones
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Verificar el estado actual del usuario demo
-- ==============================================

-- Verificar si existe el usuario demo
SELECT 
    id,
    email,
    institution_id,
    role,
    first_name,
    last_name
FROM users 
WHERE email = 'demo@demo.com' 
   OR email LIKE '%demo%'
   OR first_name = 'Usuario'
   OR last_name = 'Demo';

-- Verificar instituciones existentes
SELECT 
    id,
    name,
    email,
    created_at
FROM institutions
ORDER BY created_at DESC;

-- ==============================================
-- PASO 2: Crear institución para el usuario demo si no existe
-- ==============================================

-- Insertar institución demo si no existe
INSERT INTO institutions (id, name, email, phone, address) 
VALUES (
    'demo-institution-001',
    'Instituto Demo',
    'info@institutodemo.edu',
    '+54-11-1234-5678',
    'Av. Demo 123, Ciudad Demo, Provincia Demo'
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address;

-- ==============================================
-- PASO 3: Vincular usuario demo a la institución
-- ==============================================

-- Obtener el ID del usuario demo desde auth.users
-- (Esto debe ejecutarse manualmente reemplazando 'USER_ID_AQUI' con el ID real)

-- Opción A: Si conoces el ID del usuario demo
-- UPDATE users 
-- SET institution_id = 'demo-institution-001',
--     role = 'admin'
-- WHERE id = 'USER_ID_AQUI';

-- Opción B: Vincular por email (si el usuario existe en users)
UPDATE users 
SET institution_id = 'demo-institution-001',
    role = 'admin',
    updated_at = NOW()
WHERE email LIKE '%demo%' 
   OR first_name = 'Usuario'
   OR last_name = 'Demo';

-- Opción C: Si el usuario demo no existe en la tabla users, crearlo
-- (Reemplazar 'USER_ID_AQUI' con el ID real del usuario de auth.users)
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
    'USER_ID_AQUI', -- Reemplazar con el ID real
    'demo-institution-001',
    email,
    'admin',
    COALESCE(raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(raw_user_meta_data->>'last_name', 'Demo'),
    NOW(),
    NOW()
FROM auth.users 
WHERE email LIKE '%demo%'
   OR email = 'demo@demo.com'
ON CONFLICT (id) DO UPDATE SET
    institution_id = 'demo-institution-001',
    role = 'admin',
    updated_at = NOW();

-- ==============================================
-- PASO 4: Verificar el resultado
-- ==============================================

-- Verificar que el usuario demo tiene institución asignada
SELECT 
    u.id,
    u.email,
    u.institution_id,
    u.role,
    u.first_name,
    u.last_name,
    i.name as institution_name
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
WHERE u.email LIKE '%demo%' 
   OR u.first_name = 'Usuario'
   OR u.last_name = 'Demo';

-- Verificar que la institución demo existe
SELECT * FROM institutions WHERE id = 'demo-institution-001';

-- ==============================================
-- INSTRUCCIONES PARA USAR ESTE SCRIPT:
-- ==============================================

-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Si el usuario demo no se vincula automáticamente, necesitas:
--    a) Ir a Supabase Auth > Users
--    b) Buscar el usuario demo
--    c) Copiar su User ID
--    d) Reemplazar 'USER_ID_AQUI' en las líneas comentadas
--    e) Ejecutar las líneas descomentadas
-- 3. Verificar que el usuario demo ahora tiene institución asignada
