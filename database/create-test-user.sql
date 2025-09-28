-- Script para crear un usuario de prueba para el sistema
-- Este script debe ejecutarse en Supabase SQL Editor

-- Insertar usuario de prueba en la tabla users
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
  NULL, -- Sin institución asignada inicialmente
  'demo@educacion.com',
  'admin',
  'Usuario',
  'Demo',
  '+54-11-0000-0000'
) ON CONFLICT (email) DO UPDATE SET
  institution_id = NULL, -- Asegurar que institution_id sea NULL
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone;

-- Verificar que el usuario se creó correctamente
SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  u.phone,
  i.name as institution_name
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';

-- Mostrar información de la institución asociada
SELECT 
  'Usuario de prueba creado exitosamente' as status,
  u.email,
  u.first_name || ' ' || u.last_name as full_name,
  u.role,
  i.name as institution_name,
  i.email as institution_email
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email = 'demo@educacion.com';
