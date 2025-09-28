const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTableStructures() {
  console.log('🔍 Analizando estructuras detalladas de las tablas...\n');
  
  try {
    // Analizar tabla users (que será nuestra tabla de profesores)
    console.log('👥 TABLA USERS (Profesores/Usuarios):');
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (users && users.length > 0) {
      console.log('   Columnas:', Object.keys(users[0]).join(', '));
      console.log('   Ejemplo de datos:');
      users.forEach(user => {
        console.log(`     ${user.first_name} ${user.last_name} (${user.role}) - ${user.email}`);
      });
    }

    // Analizar tabla subjects
    console.log('\n📚 TABLA SUBJECTS:');
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .limit(3);
    
    if (subjects && subjects.length > 0) {
      console.log('   Columnas:', Object.keys(subjects[0]).join(', '));
      console.log('   Ejemplo de datos:');
      subjects.forEach(subject => {
        console.log(`     ${subject.name} (${subject.code}) - ${subject.credits} créditos`);
      });
    }

    // Verificar si hay tabla cycles
    console.log('\n🔄 VERIFICANDO TABLA CYCLES:');
    try {
      const { data: cycles } = await supabase
        .from('cycles')
        .select('*')
        .limit(3);
      
      if (cycles) {
        console.log('   ✅ Tabla cycles existe');
        console.log('   Columnas:', Object.keys(cycles[0] || {}).join(', '));
      }
    } catch (err) {
      console.log('   ❌ Tabla cycles no existe');
    }

    // Verificar si hay tabla enrollments
    console.log('\n📝 VERIFICANDO TABLA ENROLLMENTS:');
    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .limit(3);
      
      if (enrollments) {
        console.log('   ✅ Tabla enrollments existe');
        console.log('   Columnas:', Object.keys(enrollments[0] || {}).join(', '));
      }
    } catch (err) {
      console.log('   ❌ Tabla enrollments no existe');
    }

    // Verificar si hay tabla professors específica
    console.log('\n👨‍🏫 VERIFICANDO TABLA PROFESSORS:');
    try {
      const { data: professors } = await supabase
        .from('professors')
        .select('*')
        .limit(3);
      
      if (professors) {
        console.log('   ✅ Tabla professors existe');
        console.log('   Columnas:', Object.keys(professors[0] || {}).join(', '));
      }
    } catch (err) {
      console.log('   ❌ Tabla professors no existe - Usaremos tabla users');
    }

    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Usar tabla "users" para profesores (ya existe)');
    console.log('   2. Verificar si necesitamos tabla "cycles" para subjects');
    console.log('   3. Verificar si necesitamos tabla "enrollments" para inscripciones');
    console.log('   4. Ajustar nuestro código para usar la estructura real');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeTableStructures();







