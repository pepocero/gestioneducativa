-- Script para actualizar la tabla de estudiantes para permitir career_id NULL
-- Este script debe ejecutarse en Supabase SQL Editor

-- Modificar la tabla students para permitir career_id NULL
ALTER TABLE students ALTER COLUMN career_id DROP NOT NULL;

-- Agregar comentario para documentar el cambio
COMMENT ON COLUMN students.career_id IS 'ID de la carrera a la que está inscrito el estudiante. Puede ser NULL si el estudiante no está inscrito en ninguna carrera aún.';
