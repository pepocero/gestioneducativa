-- ========================================
-- CONFIGURACIÓN DE MULTI-TENANCY
-- ========================================

-- 1. Agregar campo owner_id a institutions
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_institutions_owner_id ON institutions(owner_id);

-- 3. Habilitar RLS en institutions
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- 4. Política para que usuarios solo vean sus instituciones
DROP POLICY IF EXISTS "Users can only see their own institutions" ON institutions;
CREATE POLICY "Users can only see their own institutions" ON institutions
  FOR ALL USING (auth.uid() = owner_id);

-- 5. Habilitar RLS en students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 6. Política para que estudiantes solo sean visibles por el dueño de su institución
DROP POLICY IF EXISTS "Students visible by institution owner" ON students;
CREATE POLICY "Students visible by institution owner" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = students.institution_id
      AND institutions.owner_id = auth.uid()
    )
  );

-- 7. Habilitar RLS en professors
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- 8. Política para que profesores solo sean visibles por el dueño de su institución
DROP POLICY IF EXISTS "Professors visible by institution owner" ON professors;
CREATE POLICY "Professors visible by institution owner" ON professors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = professors.institution_id
      AND institutions.owner_id = auth.uid()
    )
  );

-- 9. Actualizar instituciones existentes (si las hay)
UPDATE institutions SET owner_id = auth.uid() WHERE owner_id IS NULL;

-- 10. Crear algunas instituciones de prueba
INSERT INTO institutions (name, email, phone, address, owner_id) VALUES
(
  'Universidad Nacional',
  'contacto@un.edu',
  '+54 11 1234-5678',
  'Av. Principal 123, Ciudad, País',
  auth.uid()
),
(
  'Instituto Superior Tecnológico',
  'info@ist.edu',
  '+54 11 9876-5432',
  'Calle Tecnológica 456, Ciudad, País',
  auth.uid()
) ON CONFLICT DO NOTHING;

-- ========================================
-- CONFIGURACIÓN COMPLETADA
-- ========================================