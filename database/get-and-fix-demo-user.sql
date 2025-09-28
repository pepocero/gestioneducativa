-- Script para obtener el auth_user_id correcto y actualizar el usuario demo
-- PASO 1: Ejecuta esta consulta para obtener el auth_user_id del usuario demo

-- Buscar el auth_user_id del usuario demo en Supabase Auth
-- (Esta consulta te mostrará el auth_user_id que necesitas)
SELECT 
  'auth_user_id del usuario demo:' as info,
  id as auth_user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'demo@educacion.com';

-- PASO 2: Copia el auth_user_id de arriba y ejecuta la siguiente consulta
-- (Reemplaza 'TU_AUTH_USER_ID_AQUI' con el ID que obtuviste arriba)

-- UPDATE users 
-- SET auth_user_id = 'TU_AUTH_USER_ID_AQUI'  -- Reemplaza con el ID real
-- WHERE email = 'demo@educacion.com';

-- PASO 3: Verificar que todo esté correcto
SELECT 
  'Usuario demo actualizado:' as status,
  u.email,
  u.auth_user_id,
  u.first_name || ' ' || u.last_name as full_name,
  u.role,
  i.name as institution_name
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';

