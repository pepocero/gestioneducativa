-- Script SIMPLE para configurar el usuario demo
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Deshabilitar temporalmente RLS para configurar
-- ==============================================

-- Deshabilitar RLS temporalmente para configurar datos
ALTER TABLE institutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- PASO 2: Crear institución demo
-- ==============================================

-- Eliminar institución demo existente si existe
DELETE FROM institutions WHERE name = 'Instituto Demo';

-- Crear nueva institución demo
INSERT INTO institutions (id, name, email, phone, address) 
VALUES (
    'demo-institution-001',
    'Instituto Demo',
    'demo@educacion.com',
    '+54-11-1234-5678',
    'Av. Demo 123, Ciudad Demo, Provincia Demo'
);

-- ==============================================
-- PASO 3: Crear/actualizar usuario demo
-- ==============================================

-- IMPORTANTE: Reemplazar 'DEMO_USER_ID_AQUI' con el ID real del usuario demo
-- Para obtener el ID:
-- 1. Ve a Supabase Dashboard > Authentication > Users
-- 2. Busca el usuario demo
-- 3. Copia su User ID
-- 4. Reemplaza 'DEMO_USER_ID_AQUI' con ese ID

-- Eliminar usuario demo existente si existe
DELETE FROM users WHERE email LIKE '%demo%' OR first_name = 'Usuario';

-- Crear usuario demo
INSERT INTO users (
    id,
    institution_id,
    email,
    role,
    first_name,
    last_name,
    created_at,
    updated_at
) VALUES (
    '4741d4e3-e6b9-4ab1-9408-becd05e18b16', -- ⚠️ REEMPLAZAR CON EL ID REAL DEL USUARIO DEMO
    'demo-institution-001',
    'demo@demo.com',
    'admin',
    'Usuario',
    'Demo',
    NOW(),
    NOW()
);

-- ==============================================
-- PASO 4: Verificar configuración
-- ==============================================

-- Verificar institución creada
SELECT 'Institución Demo' as tipo, id, name, email FROM institutions WHERE id = 'demo-institution-001';

-- Verificar usuario demo
SELECT 'Usuario Demo' as tipo, id, email, institution_id, role, first_name, last_name FROM users WHERE id = 'DEMO_USER_ID_AQUI';

-- ==============================================
-- PASO 5: Rehabilitar RLS
-- ==============================================

-- Rehabilitar RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- INSTRUCCIONES:
-- ==============================================

-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. IMPORTANTE: Reemplazar 'DEMO_USER_ID_AQUI' con el ID real del usuario demo
-- 3. Para obtener el ID del usuario demo:
--    - Ve a Supabase Dashboard > Authentication > Users
--    - Busca el usuario demo (email: demo@demo.com o similar)
--    - Copia su User ID
--    - Reemplaza 'DEMO_USER_ID_AQUI' en el script
-- 4. Ejecutar nuevamente solo las líneas que insertan el usuario
-- 5. Verificar que el usuario demo ahora tiene institución asignada
