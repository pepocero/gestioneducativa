#!/bin/bash

echo "🏗️ CONFIGURANDO MULTI-TENANCY EN SUPABASE"
echo ""

# Verificar si supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "📥 Instálalo con: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Configurar el proyecto
echo "🔧 Configurando proyecto Supabase..."
echo ""

# Crear archivo SQL temporal
cat > temp_multi_tenancy.sql << 'EOF'
-- Agregar campo owner_id a institutions
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_institutions_owner_id ON institutions(owner_id);

-- Habilitar RLS en institutions
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean sus instituciones
DROP POLICY IF EXISTS "Users can only see their own institutions" ON institutions;
CREATE POLICY "Users can only see their own institutions" ON institutions
  FOR ALL USING (auth.uid() = owner_id);

-- Habilitar RLS en students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Política para que estudiantes solo sean visibles por el dueño de su institución
DROP POLICY IF EXISTS "Students visible by institution owner" ON students;
CREATE POLICY "Students visible by institution owner" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = students.institution_id
      AND institutions.owner_id = auth.uid()
    )
  );

-- Habilitar RLS en professors
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- Política para que profesores solo sean visibles por el dueño de su institución
DROP POLICY IF EXISTS "Professors visible by institution owner" ON professors;
CREATE POLICY "Professors visible by institution owner" ON professors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = professors.institution_id
      AND institutions.owner_id = auth.uid()
    )
  );

-- Actualizar instituciones existentes (si las hay)
UPDATE institutions SET owner_id = auth.uid() WHERE owner_id IS NULL;

-- Crear algunas instituciones de prueba
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
EOF

echo "📝 Archivo SQL creado: temp_multi_tenancy.sql"
echo ""

echo "🚀 Ejecutando configuración..."
echo ""

# Ejecutar el SQL
supabase db reset --db-url "postgresql://postgres:[password]@db.liqxrhrwiasewfvasems.supabase.co:5432/postgres" < temp_multi_tenancy.sql

if [ $? -eq 0 ]; then
    echo "✅ Multi-tenancy configurado exitosamente!"
    echo ""
    echo "🎯 FUNCIONALIDADES ACTIVADAS:"
    echo "   • Cada usuario solo ve sus propias instituciones"
    echo "   • Cada institución solo muestra sus propios estudiantes"
    echo "   • Cada institución solo muestra sus propios profesores"
    echo "   • Seguridad completa a nivel de base de datos"
    echo ""
    echo "🧹 Limpiando archivos temporales..."
    rm temp_multi_tenancy.sql
    echo "✅ ¡Configuración completada!"
else
    echo "❌ Error en la configuración"
    echo "💡 Ejecuta manualmente el SQL en Supabase Dashboard"
    rm temp_multi_tenancy.sql
    exit 1
fi





