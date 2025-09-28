-- Script para actualizar el enum enrollment_status con todos los valores necesarios
-- Este script debe ejecutarse en Supabase SQL Editor

-- Primero, agregar los nuevos valores al enum existente
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'rejected';

-- Verificar que los valores se agregaron correctamente
SELECT unnest(enum_range(NULL::enrollment_status)) AS enrollment_status_values;

-- Script de rollback (opcional - solo usar si necesitas revertir)
-- NOTA: No se puede eliminar valores de un enum que estén en uso
-- Para hacer rollback completo sería necesario:
-- 1. Crear un nuevo enum con los valores deseados
-- 2. Cambiar todas las columnas que usan el enum viejo al nuevo
-- 3. Eliminar el enum viejo
-- 4. Renombrar el enum nuevo

-- Ejemplo de rollback (NO EJECUTAR a menos que sea necesario):
/*
DO $$ 
BEGIN
    -- Crear nuevo enum solo con los valores originales
    CREATE TYPE enrollment_status_old AS ENUM ('enrolled', 'completed', 'dropped');
    
    -- Cambiar la columna para usar el nuevo enum (esto requiere que no haya datos con los nuevos valores)
    ALTER TABLE enrollments ALTER COLUMN status TYPE enrollment_status_old USING status::text::enrollment_status_old;
    
    -- Eliminar el enum viejo
    DROP TYPE enrollment_status;
    
    -- Renombrar el enum nuevo
    ALTER TYPE enrollment_status_old RENAME TO enrollment_status;
END $$;
*/
