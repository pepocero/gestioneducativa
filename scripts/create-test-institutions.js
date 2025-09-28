// Script para crear instituciones de prueba en Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyZXJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8Q5Ej_3XjzV8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestInstitutions() {
  console.log('🏫 Creando instituciones de prueba...')

  const institutions = [
    {
      name: 'Universidad Nacional',
      email: 'contacto@un.edu',
      phone: '+54 11 1234-5678',
      address: 'Av. Principal 123, Ciudad, País',
      created_at: new Date().toISOString()
    },
    {
      name: 'Instituto Superior Tecnológico',
      email: 'info@ist.edu',
      phone: '+54 11 9876-5432',
      address: 'Calle Tecnológica 456, Ciudad, País',
      created_at: new Date().toISOString()
    },
    {
      name: 'Colegio Modelo',
      email: 'admin@colegiomodelo.com',
      phone: '+54 11 2345-6789',
      address: 'Plaza Central 789, Ciudad, País',
      created_at: new Date().toISOString()
    }
  ]

  try {
    const { data, error } = await supabase
      .from('institutions')
      .insert(institutions)
      .select()

    if (error) {
      console.error('❌ Error creando instituciones:', error)
      return
    }

    console.log('✅ Instituciones creadas exitosamente:')
    data.forEach((institution, index) => {
      console.log(`   ${index + 1}. ${institution.name} (ID: ${institution.id})`)
    })

    console.log('\n🎯 Ahora puedes probar:')
    console.log('   • Ve a /admin/institutions')
    console.log('   • Haz clic en "Ver Detalles" de cualquier institución')
    console.log('   • Cada institución mostrará sus propios datos')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

createTestInstitutions()







