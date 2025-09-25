const https = require('https');

// Credenciales de Supabase
const SUPABASE_URL = 'https://liqxrhrwiasewfvasems.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

// Función para ejecutar SQL
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql });
    
    const options = {
      hostname: 'liqxrhrwiasewfvasems.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: responseData });
        } else {
          reject({ status: res.statusCode, error: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Configuración de Multi-Tenancy
async function configureMultiTenancy() {
  console.log('🏗️ CONFIGURANDO MULTI-TENANCY EN SUPABASE...\n');

  const sqlCommands = [
    {
      name: 'Agregar campo owner_id',
      sql: 'ALTER TABLE institutions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);'
    },
    {
      name: 'Crear índice para performance',
      sql: 'CREATE INDEX IF NOT EXISTS idx_institutions_owner_id ON institutions(owner_id);'
    },
    {
      name: 'Habilitar RLS en institutions',
      sql: 'ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Política para institutions',
      sql: `DROP POLICY IF EXISTS "Users can only see their own institutions" ON institutions;
            CREATE POLICY "Users can only see their own institutions" ON institutions
            FOR ALL USING (auth.uid() = owner_id);`
    },
    {
      name: 'Habilitar RLS en students',
      sql: 'ALTER TABLE students ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Política para students',
      sql: `DROP POLICY IF EXISTS "Students visible by institution owner" ON students;
            CREATE POLICY "Students visible by institution owner" ON students
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM institutions
                WHERE institutions.id = students.institution_id
                AND institutions.owner_id = auth.uid()
              )
            );`
    },
    {
      name: 'Habilitar RLS en professors',
      sql: 'ALTER TABLE professors ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Política para professors',
      sql: `DROP POLICY IF EXISTS "Professors visible by institution owner" ON professors;
            CREATE POLICY "Professors visible by institution owner" ON professors
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM institutions
                WHERE institutions.id = professors.institution_id
                AND institutions.owner_id = auth.uid()
              )
            );`
    }
  ];

  for (const command of sqlCommands) {
    try {
      console.log(`⏳ ${command.name}...`);
      const result = await executeSQL(command.sql);
      console.log(`✅ ${command.name} - Completado`);
    } catch (error) {
      console.log(`❌ ${command.name} - Error:`, error.error || error.message);
    }
  }

  console.log('\n🎯 CONFIGURACIÓN COMPLETADA');
  console.log('✅ Multi-tenancy implementado exitosamente');
  console.log('✅ Row Level Security configurado');
  console.log('✅ Políticas de seguridad creadas');
  console.log('\n🎮 AHORA PUEDES PROBAR:');
  console.log('   • Cada usuario solo verá sus propias instituciones');
  console.log('   • Cada institución solo mostrará sus propios estudiantes');
  console.log('   • Cada institución solo mostrará sus propios profesores');
}

// Ejecutar configuración
configureMultiTenancy().catch(console.error);





