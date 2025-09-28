-- Solución rápida para el usuario demo
-- Este script usa el auth_user_id exacto del error

-- Opción 1: Actualizar auth_user_id si el usuario ya existe
UPDATE users 
SET auth_user_id = '4741d4e3-e6b9-4ab1-9408-becd05e18b16'
WHERE email = 'demo@educacion.com';

-- Opción 2: Si no existe, crearlo desde cero
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
  '00000000-0000-0000-0000-000000000001',
  NULL, -- Sin institución asignada inicialmente
  'demo@educacion.com',
  '4741d4e3-e6b9-4ab1-9408-becd05e18b16',
  'admin',
  'Usuario',
  'Demo',
  '+54-11-0000-0000'
)
ON CONFLICT (email) DO UPDATE SET
  institution_id = NULL, -- Asegurar que institution_id sea NULL
  auth_user_id = '4741d4e3-e6b9-4ab1-9408-becd05e18b16',
  role = 'admin',
  first_name = 'Usuario',
  last_name = 'Demo',
  phone = '+54-11-0000-0000';

-- Verificar resultado
SELECT 
  'Resultado final:' as status,
  u.email,
  u.auth_user_id,
  u.first_name || ' ' || u.last_name as nombre,
  u.role,
  i.name as institucion
FROM users u
LEFT JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';
