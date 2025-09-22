-- Script para hacer career_id nullable en la tabla students
-- Esto permite crear estudiantes sin carrera asignada inicialmente

-- Hacer la columna career_id nullable
ALTER TABLE public.students 
ALTER COLUMN career_id DROP NOT NULL;

-- Mensaje de confirmación
SELECT 'Columna career_id ahora es nullable' as status;
