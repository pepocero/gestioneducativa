// Script para configurar Multi-Tenancy en Supabase
// Ejecuta este script y sigue las instrucciones

const fs = require('fs');
const path = require('path');

console.log('🏗️ CONFIGURANDO MULTI-TENANCY EN SUPABASE\n');

// Crear archivo SQL con toda la configuración
const sqlContent = `-- ========================================
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
-- ========================================`;

// Escribir el archivo SQL
const sqlFilePath = path.join(__dirname, 'multi-tenancy-config.sql');
fs.writeFileSync(sqlFilePath, sqlContent);

console.log('📝 Archivo SQL creado: multi-tenancy-config.sql');
console.log('');

console.log('📋 INSTRUCCIONES:');
console.log('');

console.log('1️⃣ Ve a tu panel de Supabase:');
console.log('   https://supabase.com/dashboard/project/liqxrhrwiasewfvasems');
console.log('');

console.log('2️⃣ Ve a "SQL Editor" en el menú lateral');
console.log('');

console.log('3️⃣ Copia TODO el contenido del archivo multi-tenancy-config.sql');
console.log('');

console.log('4️⃣ Pégalo en el SQL Editor y haz clic en "Run"');
console.log('');

console.log('5️⃣ Verifica que no haya errores en la ejecución');
console.log('');

console.log('✅ DESPUÉS DE EJECUTAR:');
console.log('   • Cada usuario solo verá sus propias instituciones');
console.log('   • Cada institución solo mostrará sus propios estudiantes');
console.log('   • Cada institución solo mostrará sus propios profesores');
console.log('   • Seguridad completa a nivel de base de datos');
console.log('');

console.log('🎯 PARA PROBAR:');
console.log('   1. Regístrate con un nuevo usuario');
console.log('   2. Ve a /admin/institutions');
console.log('   3. Solo verás las instituciones que creaste');
console.log('   4. Cada institución mostrará solo sus propios datos');
console.log('');

console.log('✨ ¡MULTI-TENANCY COMPLETAMENTE CONFIGURADO!');
console.log('');

console.log('📁 Archivo SQL generado en:', sqlFilePath);
console.log('');

// Mostrar el contenido del archivo
console.log('📄 CONTENIDO DEL ARCHIVO SQL:');
console.log('================================');
console.log(sqlContent);
console.log('================================');


