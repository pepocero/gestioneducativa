-- Script para hacer institution_id nullable en la tabla users
-- Este script corrige el problema de que institution_id debe poder ser NULL

-- PASO 1: Verificar la estructura actual de la tabla users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'institution_id';

-- PASO 2: Eliminar la restricción NOT NULL del campo institution_id
ALTER TABLE users 
ALTER COLUMN institution_id DROP NOT NULL;

-- PASO 3: Verificar que el cambio se aplicó correctamente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'institution_id';

-- PASO 4: Actualizar el usuario demo para que tenga institution_id NULL
UPDATE users 
SET institution_id = NULL
WHERE email = 'demo@educacion.com';

-- PASO 5: Verificar que el usuario demo ahora tiene institution_id NULL
SELECT 
  'Usuario demo actualizado:' as status,
  id,
  email,
  institution_id,
  first_name || ' ' || last_name as full_name,
  role
FROM users 
WHERE email = 'demo@educacion.com';

-- PASO 6: Mostrar resumen de la corrección
SELECT 
  'Corrección aplicada exitosamente' as resultado,
  'institution_id ahora puede ser NULL' as cambio,
  'El usuario demo tiene institution_id = NULL' as usuario_demo;

