-- Script manual para corregir el usuario demo
-- Basado en el auth_user_id que aparece en el error: 4741d4e3-e6b9-4ab1-9408-becd05e18b16

-- PASO 1: Eliminar cualquier usuario demo existente para empezar limpio
DELETE FROM users WHERE email = 'demo@educacion.com';

-- PASO 2: Insertar el usuario demo con el auth_user_id correcto
INSERT INTO users (
  id,
  institution_id,
  email,
  auth_user_id,
  role,
  first_name,
  last_name,
  phone
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- ID fijo
  (SELECT id FROM institutions LIMIT 1), -- Primera institución disponible
  'demo@educacion.com',
  '4741d4e3-e6b9-4ab1-9408-becd05e18b16', -- El auth_user_id del error
  'admin',
  'Usuario',
  'Demo',
  '+54-11-0000-0000'
);

-- PASO 3: Verificar que se insertó correctamente
SELECT 
  'Usuario demo creado:' as status,
  id,
  email,
  auth_user_id,
  first_name || ' ' || last_name as full_name,
  role,
  institution_id
FROM users 
WHERE email = 'demo@educacion.com';

-- PASO 4: Verificar que el auth_user_id coincide con auth.users
SELECT 
  'Verificación final:' as status,
  CASE 
    WHEN (SELECT id FROM auth.users WHERE email = 'demo@educacion.com') = 
         (SELECT auth_user_id FROM users WHERE email = 'demo@educacion.com')
    THEN '✅ auth_user_id coincide correctamente'
    ELSE '❌ auth_user_id NO coincide'
  END as resultado,
  (SELECT id FROM auth.users WHERE email = 'demo@educacion.com') as auth_users_id,
  (SELECT auth_user_id FROM users WHERE email = 'demo@educacion.com') as users_auth_id;

-- PASO 5: Mostrar información de la institución asociada
SELECT 
  'Información de la institución:' as info,
  u.email,
  u.first_name || ' ' || u.last_name as usuario,
  u.role,
  i.name as institucion,
  i.email as institucion_email
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';

