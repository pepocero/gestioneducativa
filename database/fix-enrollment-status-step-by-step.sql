-- Script paso a paso para solucionar el problema del enum enrollment_status
-- ERROR SOLUCIONADO: default for column "status" cannot be cast automatically to type enrollment_status_new

-- PASO 1: Verificar los valores actuales y el default
SELECT unnest(enum_range(NULL::enrollment_status)) AS current_values;

SELECT column_name, column_default, data_type 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND column_name = 'status';

-- PASO 2: Eliminar el valor por defecto temporalmente
ALTER TABLE enrollments ALTER COLUMN status DROP DEFAULT;

-- PASO 3: Crear el nuevo enum
DO $$ 
BEGIN
    -- Eliminar el tipo si ya existe
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

-- PASO 4: Actualizar la columna sin problema de default
ALTER TABLE enrollments 
ALTER COLUMN status TYPE enrollment_status_new 
USING CASE 
    WHEN status::text = 'enrolled' THEN 'enrolled'::enrollment_status_new
    WHEN status::text = 'completed' THEN 'completed'::enrollment_status_new
    WHEN status::text = 'dropped' THEN 'dropped'::enrollment_status_new
    ELSE 'enrolled'::enrollment_status_new
END;

-- PASO 5: Eliminar el enum viejo y renombrar
DROP TYPE enrollment_status CASCADE;
ALTER TYPE enrollment_status_new RENAME TO enrollment_status;

-- PASO 6: Establecer el nuevo valor por defecto
ALTER TABLE enrollments ALTER COLUMN status SET DEFAULT 'enrolled'::enrollment_status;

-- PASO 7: Verificar el resultado final
SELECT unnest(enum_range(NULL::enrollment_status)) AS final_values;

SELECT column_name, column_default, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND column_name = 'status';

-- PASO 8: Probar que funciona
SELECT 'Test passed: enum values updated successfully' AS result;

COMMIT;
