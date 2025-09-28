-- Script para diagnosticar el problema del usuario demo
-- Ejecuta estas consultas paso a paso para identificar el problema

-- PASO 1: Verificar si el usuario existe en auth.users
SELECT 
  'Verificación en auth.users:' as info,
  id as auth_user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'demo@educacion.com';

-- PASO 2: Verificar si el usuario existe en la tabla users
SELECT 
  'Verificación en tabla users:' as info,
  id,
  email,
  auth_user_id,
  first_name,
  last_name,
  role,
  institution_id
FROM users 
WHERE email = 'demo@educacion.com';

-- PASO 3: Verificar si hay algún usuario con ese auth_user_id específico
SELECT 
  'Búsqueda por auth_user_id específico:' as info,
  id,
  email,
  auth_user_id,
  first_name,
  last_name,
  role
FROM users 
WHERE auth_user_id = '4741d4e3-e6b9-4ab1-9408-becd05e18b16';

-- PASO 4: Verificar todas las instituciones disponibles
SELECT 
  'Instituciones disponibles:' as info,
  id,
  name,
  email
FROM institutions;

-- PASO 5: Mostrar resumen del problema
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@educacion.com') 
      AND EXISTS (SELECT 1 FROM users WHERE email = 'demo@educacion.com')
      AND (SELECT auth_user_id FROM users WHERE email = 'demo@educacion.com') = 
          (SELECT id FROM auth.users WHERE email = 'demo@educacion.com')
    THEN '✅ Usuario configurado correctamente'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@educacion.com') 
      AND EXISTS (SELECT 1 FROM users WHERE email = 'demo@educacion.com')
      AND (SELECT auth_user_id FROM users WHERE email = 'demo@educacion.com') != 
          (SELECT id FROM auth.users WHERE email = 'demo@educacion.com')
    THEN '❌ auth_user_id no coincide'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@educacion.com') 
      AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@educacion.com')
    THEN '❌ Usuario existe en auth.users pero no en tabla users'
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@educacion.com') 
      AND EXISTS (SELECT 1 FROM users WHERE email = 'demo@educacion.com')
    THEN '❌ Usuario existe en tabla users pero no en auth.users'
    ELSE '❌ Usuario no existe en ninguna tabla'
  END as diagnostico;

