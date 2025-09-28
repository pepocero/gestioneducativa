-- Script para corregir el auth_user_id del usuario demo
-- Este script debe ejecutarse DESPUÉS de crear el usuario en Supabase Auth

-- IMPORTANTE: Reemplaza '4741d4e3-e6b9-4ab1-9408-becd05e18b16' con el auth_user_id real
-- que aparece en el error de la consola del navegador

-- Actualizar el auth_user_id del usuario demo
UPDATE users 
SET auth_user_id = '4741d4e3-e6b9-4ab1-9408-becd05e18b16'  -- Reemplaza con tu auth_user_id real
WHERE email = 'demo@educacion.com';

-- Verificar que la actualización fue exitosa
SELECT 
  id,
  email,
  auth_user_id,
  first_name,
  last_name,
  role,
  institution_id
FROM users 
WHERE email = 'demo@educacion.com';

-- Mostrar información de la institución asociada
SELECT 
  'Usuario demo actualizado exitosamente' as status,
  u.email,
  u.auth_user_id,
  u.first_name || ' ' || u.last_name as full_name,
  u.role,
  i.name as institution_name
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';

