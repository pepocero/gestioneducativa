-- Script para crear datos de prueba completos
-- Este script debe ejecutarse DESPUÉS de create-test-user.sql

-- Verificar que existe al menos una institución
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM institutions LIMIT 1) THEN
    -- Crear institución de ejemplo si no existe
    INSERT INTO institutions (name, email, phone, address) VALUES
    ('Universidad Demo', 'demo@universidad.com', '+54-11-1234-5678', 'Av. Demo 123, Ciudad Demo');
  END IF;
END $$;

-- Crear carrera de ejemplo
INSERT INTO careers (institution_id, name, description, duration_years) 
SELECT 
  i.id,
  'Ingeniería en Sistemas',
  'Carrera de grado en ingeniería de sistemas de información',
  5
FROM institutions i 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Crear ciclo de ejemplo
INSERT INTO cycles (career_id, name, year)
SELECT 
  c.id,
  'Primer Año',
  1
FROM careers c 
JOIN institutions i ON c.institution_id = i.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Crear materia de ejemplo
INSERT INTO subjects_new (career_id, name, code, description, credits)
SELECT 
  c.id,
  'Programación I',
  'PROG1',
  'Introducción a la programación y algoritmos',
  4
FROM careers c 
JOIN institutions i ON c.institution_id = i.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Crear otra materia de ejemplo
INSERT INTO subjects_new (career_id, name, code, description, credits)
SELECT 
  c.id,
  'Matemáticas I',
  'MATH1',
  'Álgebra y cálculo diferencial',
  6
FROM careers c 
JOIN institutions i ON c.institution_id = i.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Crear estudiante de ejemplo
INSERT INTO users (institution_id, email, role, first_name, last_name, phone)
SELECT 
  i.id,
  'estudiante.demo@universidad.com',
  'student',
  'Ana',
  'Estudiante Demo',
  '+54-11-1111-1111'
FROM institutions i 
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Crear registro de estudiante
INSERT INTO students (user_id, institution_id, career_id, student_number, enrollment_date)
SELECT 
  u.id,
  u.institution_id,
  c.id,
  'EST001',
  CURRENT_DATE
FROM users u
JOIN institutions i ON u.institution_id = i.id
JOIN careers c ON c.institution_id = i.id
WHERE u.email = 'estudiante.demo@universidad.com'
LIMIT 1
ON CONFLICT (student_number) DO NOTHING;

-- Crear profesor de ejemplo
INSERT INTO users (institution_id, email, role, first_name, last_name, phone)
SELECT 
  i.id,
  'profesor.demo@universidad.com',
  'professor',
  'Carlos',
  'Profesor Demo',
  '+54-11-2222-2222'
FROM institutions i 
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Crear inscripción de ejemplo
INSERT INTO enrollments (student_id, subject_id, enrollment_date, status)
SELECT 
  s.id,
  sub.id,
  CURRENT_DATE,
  'pending'
FROM students s
JOIN users u ON s.user_id = u.id
JOIN subjects_new sub ON sub.career_id = s.career_id
WHERE u.email = 'estudiante.demo@universidad.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Mostrar resumen de datos creados
SELECT 
  'Datos de prueba creados exitosamente' as status,
  (SELECT COUNT(*) FROM institutions) as instituciones,
  (SELECT COUNT(*) FROM careers) as carreras,
  (SELECT COUNT(*) FROM cycles) as ciclos,
  (SELECT COUNT(*) FROM subjects_new) as materias,
  (SELECT COUNT(*) FROM users WHERE role = 'student') as estudiantes,
  (SELECT COUNT(*) FROM users WHERE role = 'professor') as profesores,
  (SELECT COUNT(*) FROM enrollments) as inscripciones;

