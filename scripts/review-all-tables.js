const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function reviewAllTables() {
  console.log('🔍 Revisando todas las tablas de Supabase...\n');
  
  try {
    // Lista de tablas que queremos verificar
    const tablesToCheck = [
      'institutions',
      'careers', 
      'students',
      'professors',
      'subjects',
      'users',
      'user_profiles',
      'institution_users',
      'student_enrollments',
      'subject_enrollments',
      'grades',
      'attendance',
      'announcements',
      'courses',
      'departments',
      'faculties',
      'programs',
      'semesters',
      'academic_years'
    ];

    const existingTables = [];
    const nonExistingTables = [];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          nonExistingTables.push(tableName);
        } else {
          existingTables.push(tableName);
          console.log(`✅ Tabla '${tableName}' existe`);
          
          // Mostrar estructura de la tabla
          if (data.length > 0) {
            console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
          } else {
            console.log(`   Tabla vacía`);
          }
        }
      } catch (err) {
        nonExistingTables.push(tableName);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Tablas existentes (${existingTables.length}): ${existingTables.join(', ')}`);
    console.log(`❌ Tablas no existentes (${nonExistingTables.length}): ${nonExistingTables.join(', ')}`);

    // Verificar datos en tablas existentes
    console.log('\n📈 DATOS EN TABLAS EXISTENTES:');
    for (const tableName of existingTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`   ${tableName}: Error obteniendo conteo`);
        } else {
          console.log(`   ${tableName}: ${count} registros`);
        }
      } catch (err) {
        console.log(`   ${tableName}: Error obteniendo conteo`);
      }
    }

    // Verificar relaciones entre tablas
    console.log('\n🔗 VERIFICANDO RELACIONES:');
    
    // Verificar si hay datos relacionados
    if (existingTables.includes('institutions') && existingTables.includes('careers')) {
      try {
        const { data: careersWithInstitutions } = await supabase
          .from('careers')
          .select('id, name, institution_id, institutions(name)')
          .limit(3);
        
        console.log('   Relación careers -> institutions:');
        careersWithInstitutions?.forEach(career => {
          console.log(`     ${career.name} -> ${career.institutions?.name || 'Sin institución'}`);
        });
      } catch (err) {
        console.log('   Error verificando relación careers -> institutions');
      }
    }

    if (existingTables.includes('students') && existingTables.includes('careers')) {
      try {
        const { data: studentsWithCareers } = await supabase
          .from('students')
          .select('id, student_number, career_id, careers(name)')
          .limit(3);
        
        console.log('   Relación students -> careers:');
        studentsWithCareers?.forEach(student => {
          console.log(`     ${student.student_number} -> ${student.careers?.name || 'Sin carrera'}`);
        });
      } catch (err) {
        console.log('   Error verificando relación students -> careers');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

reviewAllTables();






