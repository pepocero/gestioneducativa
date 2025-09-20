console.log('🏗️ IMPLEMENTANDO MULTI-TENANCY POR USUARIO\n');

console.log('📋 PASOS PARA IMPLEMENTAR MULTI-TENANCY:');
console.log('');

console.log('1️⃣ ACTUALIZAR ESQUEMA DE BASE DE DATOS:');
console.log('   Ejecuta este SQL en Supabase SQL Editor:');
console.log('');

console.log('-- Agregar campo owner_id a la tabla institutions');
console.log('ALTER TABLE institutions ADD COLUMN owner_id UUID REFERENCES auth.users(id);');
console.log('');

console.log('-- Crear índice para mejorar performance');
console.log('CREATE INDEX idx_institutions_owner_id ON institutions(owner_id);');
console.log('');

console.log('2️⃣ CONFIGURAR ROW LEVEL SECURITY (RLS):');
console.log('   Ejecuta este SQL en Supabase SQL Editor:');
console.log('');

console.log('-- Habilitar RLS en institutions');
console.log('ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;');
console.log('');

console.log('-- Política para que usuarios solo vean sus instituciones');
console.log('CREATE POLICY "Users can only see their own institutions" ON institutions');
console.log('  FOR ALL USING (auth.uid() = owner_id);');
console.log('');

console.log('-- Habilitar RLS en students');
console.log('ALTER TABLE students ENABLE ROW LEVEL SECURITY;');
console.log('');

console.log('-- Política para que estudiantes solo sean visibles por el dueño de su institución');
console.log('CREATE POLICY "Students visible by institution owner" ON students');
console.log('  FOR ALL USING (');
console.log('    EXISTS (');
console.log('      SELECT 1 FROM institutions');
console.log('      WHERE institutions.id = students.institution_id');
console.log('      AND institutions.owner_id = auth.uid()');
console.log('    )');
console.log('  );');
console.log('');

console.log('-- Habilitar RLS en professors');
console.log('ALTER TABLE professors ENABLE ROW LEVEL SECURITY;');
console.log('');

console.log('-- Política para que profesores solo sean visibles por el dueño de su institución');
console.log('CREATE POLICY "Professors visible by institution owner" ON professors');
console.log('  FOR ALL USING (');
console.log('    EXISTS (');
console.log('      SELECT 1 FROM institutions');
console.log('      WHERE institutions.id = professors.institution_id');
console.log('      AND institutions.owner_id = auth.uid()');
console.log('    )');
console.log('  );');
console.log('');

console.log('3️⃣ ACTUALIZAR SERVICIOS DE SUPABASE:');
console.log('   Los servicios ya están configurados para usar el usuario autenticado');
console.log('');

console.log('4️⃣ ACTUALIZAR REGISTRO DE USUARIOS:');
console.log('   Cuando un usuario se registra, debe crear su primera institución');
console.log('');

console.log('✨ DESPUÉS DE IMPLEMENTAR:');
console.log('   • Cada usuario solo verá sus propias instituciones');
console.log('   • Cada institución solo mostrará sus propios estudiantes');
console.log('   • Cada institución solo mostrará sus propios profesores');
console.log('   • Seguridad completa a nivel de base de datos');

