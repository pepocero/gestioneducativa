-- ALTERNATIVA SIMPLE: Si el script complejo falla, usar este método
-- Este script agrega los valores uno por uno al enum existente

-- PASO 1: Verificar estado actual
SELECT unnest(enum_range(NULL::enrollment_status)) AS current_values;

-- PASO 2: Intentar agregar los valores faltantes uno por uno
-- Nota: Si un valor ya existe, PostgreSQL lo ignorará silenciosamente

BEGIN;

-- Agregar 'pending' si no existe
DO $$ 
BEGIN
    EXECUTE 'ALTER TYPE enrollment_status ADD VALUE ''pending''';
    RAISE NOTICE 'Agregado: pending';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'pending ya existe, saltando...';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error agregando pending: %', SQLERRM;
END $$;

-- Agregar 'approved' si no existe  
DO $$ 
BEGIN
    EXECUTE 'ALTER TYPE enrollment_status ADD VALUE ''approved''';
    RAISE NOTICE 'Agregado: approved';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'approved ya existe, saltando...';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error agregando approved: %', SQLERRM;
END $$;

-- Agregar 'rejected' si no existe
DO $$ 
BEGIN
    EXECUTE 'ALTER TYPE enrollment_status ADD VALUE ''rejected''';
    RAISE NOTICE 'Agregado: rejected';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'rejected ya existe, saltando...';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error agregando rejected: %', SQLERRM;
END $$;

COMMIT;

-- PASO 3: Verificar el resultado
SELECT unnest(enum_range(NULL::enrollment_status)) AS updated_values;

-- PASO 4: Probar una actualización
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Obtener un ID de prueba
    SELECT id INTO test_id FROM enrollments LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Intentar actualizar a pending (esto debería funcionar ahora)
        UPDATE enrollments SET status = 'pending' WHERE id = test_id;
        RAISE NOTICE 'Prueba exitosa: actualización a pending funcionó';
        
        -- Revertir a enrolled
        UPDATE enrollments SET status = 'enrolled' WHERE id = test_id;
        RAISE NOTICE 'Revertido a enrolled';
    ELSE
        RAISE NOTICE 'No hay datos de prueba disponibles';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en prueba: %', SQLERRM;
END $$;
