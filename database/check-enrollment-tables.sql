-- Script para verificar las tablas de inscripciones disponibles

-- 1. Verificar todas las tablas que contienen 'enrollment' o 'subject'
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%enrollment%' OR table_name LIKE '%subject%')
ORDER BY table_name;

-- 2. Verificar estructura de subject_enrollments si existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subject_enrollments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estructura de enrollments si existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar si hay datos en alguna tabla de inscripciones
SELECT 'subject_enrollments' as tabla, COUNT(*) as registros FROM subject_enrollments
UNION ALL
SELECT 'enrollments' as tabla, COUNT(*) as registros FROM enrollments;



