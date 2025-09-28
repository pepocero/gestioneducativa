-- Script completo para configurar el usuario demo
-- Este script maneja todo automáticamente

-- PASO 1: Crear/actualizar usuario demo en la tabla users
INSERT INTO users (
  id,
  institution_id,
  email,
  role,
  first_name,
  last_name,
  phone
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- ID fijo para el usuario de prueba
  (SELECT id FROM institutions LIMIT 1), -- Usar la primera institución disponible
  'demo@educacion.com',
  'admin',
  'Usuario',
  'Demo',
  '+54-11-0000-0000'
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone;

-- PASO 2: Obtener el auth_user_id del usuario demo de Supabase Auth
-- (Este paso requiere que ya hayas creado el usuario en Authentication)
DO $$
DECLARE
  demo_auth_id UUID;
BEGIN
  -- Obtener el auth_user_id del usuario demo
  SELECT id INTO demo_auth_id 
  FROM auth.users 
  WHERE email = 'demo@educacion.com';
  
  -- Actualizar el auth_user_id en la tabla users
  IF demo_auth_id IS NOT NULL THEN
    UPDATE users 
    SET auth_user_id = demo_auth_id
    WHERE email = 'demo@educacion.com';
    
    RAISE NOTICE 'Usuario demo actualizado con auth_user_id: %', demo_auth_id;
  ELSE
    RAISE NOTICE 'Usuario demo no encontrado en auth.users. Asegúrate de crearlo en Authentication primero.';
  END IF;
END $$;

-- PASO 3: Verificar configuración final
SELECT 
  'Configuración del usuario demo:' as status,
  u.email,
  u.auth_user_id,
  u.first_name || ' ' || u.last_name as full_name,
  u.role,
  i.name as institution_name,
  CASE 
    WHEN u.auth_user_id IS NOT NULL THEN '✅ Configurado correctamente'
    ELSE '❌ Falta auth_user_id'
  END as auth_status
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';
