-- Script completo para solucionar el problema del enum enrollment_status
-- Este script debe ejecutarse paso a paso en Supabase SQL Editor

-- PASO 1: Verificar los valores actuales del enum
SELECT unnest(enum_range(NULL::enrollment_status)) AS current_values;

-- PASO 2: Crear un nuevo enum con todos los valores necesarios
DO $$ 
BEGIN
    -- Eliminar el tipo si ya existe (para recreación limpia)
    DROP TYPE IF EXISTS enrollment_status_new CASCADE;
    
    -- Crear el nuevo enum con todos los valores necesarios
    CREATE TYPE enrollment_status_new AS ENUM (
        'pending',
        'approved', 
        'enrolled',
        'completed',
        'rejected',
        'dropped'
    );
    
    RAISE NOTICE 'Nuevo enum enrollment_status_new creado exitosamente';
END $$;

-- PASO 3: Actualizar la tabla enrollments para usar el nuevo enum
ALTER TABLE enrollments 
ALTER COLUMN status TYPE enrollment_status_new 
USING CASE 
    WHEN status::text = 'enrolled' THEN 'enrolled'::enrollment_status_new
    WHEN status::text = 'completed' THEN 'completed'::enrollment_status_new
    WHEN status::text = 'dropped' THEN 'dropped'::enrollment_status_new
    ELSE 'enrolled'::enrollment_status_new  -- valor por defecto para datos existentes
END;

-- PASO 4: Eliminar el enum viejo y renombrar el nuevo
DROP TYPE enrollment_status CASCADE;
ALTER TYPE enrollment_status_new RENAME TO enrollment_status;

-- PASO 5: Verificar que todo funcionó correctamente
SELECT unnest(enum_range(NULL::enrollment_status)) AS updated_values;

-- PASO 6: Verificar la estructura de la tabla
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND column_name = 'status';

-- PASO 7: Actualizar algunos registros de prueba (opcional)
-- UPDATE enrollments SET status = 'pending' WHERE status = 'enrolled' LIMIT 1;

COMMIT;
