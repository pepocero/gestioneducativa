-- Crear usuario Rogelio Stack en Supabase Auth
-- Ejecutar en Supabase SQL Editor

-- ==============================================
-- PASO 1: Verificar estado actual
-- ==============================================

SELECT 'USUARIOS EN TABLA USERS:' as info;
SELECT id, email, first_name, last_name, institution_id, role 
FROM users 
WHERE email = 'rogstack@gmail.com';

SELECT 'INSTITUCIONES:' as info;
SELECT id, name, email 
FROM institutions 
WHERE email = 'rogstack@gmail.com';

-- ==============================================
-- PASO 2: Crear función para crear usuario en Auth
-- ==============================================

-- NOTA: No podemos crear usuarios en auth.users directamente desde SQL
-- Necesitamos usar la API de Supabase Auth o crear el usuario desde el frontend

-- ==============================================
-- PASO 3: Alternativa - Eliminar datos huérfanos y permitir nuevo registro
-- ==============================================

-- Eliminar usuario huérfano de la tabla users
DELETE FROM users WHERE email = 'rogstack@gmail.com' AND id NOT IN (
    SELECT id FROM auth.users WHERE email = 'rogstack@gmail.com'
);

-- Eliminar institución huérfana
DELETE FROM institutions WHERE email = 'rogstack@gmail.com' AND id NOT IN (
    SELECT institution_id FROM users WHERE email = 'rogstack@gmail.com'
);

-- ==============================================
-- PASO 4: Verificar limpieza
-- ==============================================

SELECT 'ESTADO DESPUÉS DE LIMPIEZA:' as info;
SELECT 'USUARIOS:' as tabla;
SELECT id, email, first_name, last_name, institution_id, role 
FROM users 
WHERE email = 'rogstack@gmail.com';

SELECT 'INSTITUCIONES:' as tabla;
SELECT id, name, email 
FROM institutions 
WHERE email = 'rogstack@gmail.com';

SELECT 'TODOS LOS USUARIOS:' as info;
SELECT id, email, first_name, last_name, institution_id, role 
FROM users 
ORDER BY created_at DESC;

SELECT 'TODAS LAS INSTITUCIONES:' as info;
SELECT id, name, email, created_at 
FROM institutions 
ORDER BY created_at DESC;
