-- Script para corregir la foreign key constraint de enrollments
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la constraint actual
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='enrollments'
  AND kcu.column_name = 'subject_id';

-- 2. Eliminar la constraint actual
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_subject_id_fkey;

-- 3. Crear nueva constraint que apunte a subjects_new
ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_subject_id_fkey 
FOREIGN KEY (subject_id) REFERENCES subjects_new(id) ON DELETE CASCADE;

-- 4. Verificar que se creó correctamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='enrollments'
  AND kcu.column_name = 'subject_id';


