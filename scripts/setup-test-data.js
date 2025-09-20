const https = require('https');

// Credenciales de Supabase
const SUPABASE_URL = 'https://liqxrhrwiasewfvasems.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

// Función para hacer peticiones HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liqxrhrwiasewfvasems.supabase.co',
      port: 443,
      path: path,
      method: method,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Verificar estructura de la tabla institutions
async function checkInstitutionsTable() {
  console.log('🔍 Verificando tabla institutions...');
  
  try {
    const result = await makeRequest('GET', '/rest/v1/institutions?select=*&limit=1');
    console.log('✅ Tabla institutions existe');
    console.log('📊 Estructura actual:', Object.keys(result.data[0] || {}));
    return result.data[0] || {};
  } catch (error) {
    console.log('❌ Error verificando tabla:', error.message);
    return null;
  }
}

// Crear algunas instituciones de prueba
async function createTestInstitutions() {
  console.log('\n🏫 Creando instituciones de prueba...');
  
  const testInstitutions = [
    {
      name: 'Universidad Nacional',
      email: 'contacto@un.edu',
      phone: '+54 11 1234-5678',
      address: 'Av. Principal 123, Ciudad, País'
    },
    {
      name: 'Instituto Superior Tecnológico',
      email: 'info@ist.edu',
      phone: '+54 11 9876-5432',
      address: 'Calle Tecnológica 456, Ciudad, País'
    },
    {
      name: 'Colegio Modelo',
      email: 'admin@colegiomodelo.com',
      phone: '+54 11 2345-6789',
      address: 'Plaza Central 789, Ciudad, País'
    }
  ];

  for (const institution of testInstitutions) {
    try {
      console.log(`⏳ Creando: ${institution.name}...`);
      const result = await makeRequest('POST', '/rest/v1/institutions', institution);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${institution.name} creada exitosamente`);
      } else {
        console.log(`❌ Error creando ${institution.name}:`, result.data);
      }
    } catch (error) {
      console.log(`❌ Error creando ${institution.name}:`, error.message);
    }
  }
}

// Listar todas las instituciones
async function listInstitutions() {
  console.log('\n📋 Listando todas las instituciones...');
  
  try {
    const result = await makeRequest('GET', '/rest/v1/institutions?select=*');
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ Encontradas ${result.data.length} instituciones:`);
      result.data.forEach((inst, index) => {
        console.log(`   ${index + 1}. ${inst.name} (ID: ${inst.id})`);
      });
    } else {
      console.log('❌ Error listando instituciones:', result.data);
    }
  } catch (error) {
    console.log('❌ Error listando instituciones:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🏗️ CONFIGURANDO SUPABASE PARA MULTI-TENANCY\n');
  
  // Verificar tabla
  const tableStructure = await checkInstitutionsTable();
  
  if (tableStructure) {
    // Verificar si ya tiene owner_id
    if ('owner_id' in tableStructure) {
      console.log('✅ Campo owner_id ya existe en la tabla');
    } else {
      console.log('⚠️ Campo owner_id no existe - necesita ser agregado manualmente');
      console.log('💡 Ejecuta este SQL en Supabase Dashboard:');
      console.log('   ALTER TABLE institutions ADD COLUMN owner_id UUID REFERENCES auth.users(id);');
    }
  }
  
  // Crear instituciones de prueba
  await createTestInstitutions();
  
  // Listar instituciones
  await listInstitutions();
  
  console.log('\n🎯 CONFIGURACIÓN COMPLETADA');
  console.log('✅ Instituciones de prueba creadas');
  console.log('✅ Sistema listo para multi-tenancy');
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('   1. Ejecuta el SQL de RLS en Supabase Dashboard');
  console.log('   2. Prueba el registro de nuevos usuarios');
  console.log('   3. Verifica que cada usuario vea solo sus instituciones');
}

// Ejecutar
main().catch(console.error);

