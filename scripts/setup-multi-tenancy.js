// Script para configurar Multi-Tenancy en Supabase
// Ejecuta este script paso a paso en el SQL Editor de Supabase

console.log('🏗️ CONFIGURANDO MULTI-TENANCY EN SUPABASE\n');

console.log('📋 INSTRUCCIONES PASO A PASO:');
console.log('');

console.log('1️⃣ PASO 1: Agregar campo owner_id');
console.log('   Copia y pega este SQL en Supabase SQL Editor:');
console.log('');
console.log('ALTER TABLE institutions ADD COLUMN owner_id UUID REFERENCES auth.users(id);');
console.log('CREATE INDEX idx_institutions_owner_id ON institutions(owner_id);');
console.log('');

console.log('2️⃣ PASO 2: Configurar Row Level Security para institutions');
console.log('   Copia y pega este SQL:');
console.log('');
console.log('ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;');
console.log('');
console.log('CREATE POLICY "Users can only see their own institutions" ON institutions');
console.log('  FOR ALL USING (auth.uid() = owner_id);');
console.log('');

console.log('3️⃣ PASO 3: Configurar RLS para students');
console.log('   Copia y pega este SQL:');
console.log('');
console.log('ALTER TABLE students ENABLE ROW LEVEL SECURITY;');
console.log('');
console.log('CREATE POLICY "Students visible by institution owner" ON students');
console.log('  FOR ALL USING (');
console.log('    EXISTS (');
console.log('      SELECT 1 FROM institutions');
console.log('      WHERE institutions.id = students.institution_id');
console.log('      AND institutions.owner_id = auth.uid()');
console.log('    )');
console.log('  );');
console.log('');

console.log('4️⃣ PASO 4: Configurar RLS para professors');
console.log('   Copia y pega este SQL:');
console.log('');
console.log('ALTER TABLE professors ENABLE ROW LEVEL SECURITY;');
console.log('');
console.log('CREATE POLICY "Professors visible by institution owner" ON professors');
console.log('  FOR ALL USING (');
console.log('    EXISTS (');
console.log('      SELECT 1 FROM institutions');
console.log('      WHERE institutions.id = professors.institution_id');
console.log('      AND institutions.owner_id = auth.uid()');
console.log('    )');
console.log('  );');
console.log('');

console.log('5️⃣ PASO 5: Actualizar instituciones existentes (si las hay)');
console.log('   Si ya tienes instituciones creadas, ejecuta esto:');
console.log('');
console.log('UPDATE institutions SET owner_id = auth.uid() WHERE owner_id IS NULL;');
console.log('');

console.log('6️⃣ PASO 6: Crear algunas instituciones de prueba');
console.log('   Ejecuta este SQL para crear instituciones de prueba:');
console.log('');
console.log('INSERT INTO institutions (name, email, phone, address, owner_id) VALUES');
console.log('(');
console.log("  'Universidad Nacional',");
console.log("  'contacto@un.edu',");
console.log("  '+54 11 1234-5678',");
console.log("  'Av. Principal 123, Ciudad, País',");
console.log('  auth.uid()');
console.log('),');
console.log('(');
console.log("  'Instituto Superior Tecnológico',");
console.log("  'info@ist.edu',");
console.log("  '+54 11 9876-5432',");
console.log("  'Calle Tecnológica 456, Ciudad, País',");
console.log('  auth.uid()');
console.log(');');
console.log('');

console.log('✅ DESPUÉS DE EJECUTAR TODO:');
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

