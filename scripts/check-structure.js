const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Verificando estructura de tablas...');
  
  try {
    // Verificar estructura de institutions
    console.log('Estructura de institutions:');
    const { data: instData, error: instError } = await supabase
      .from('institutions')
      .select('*')
      .limit(1);
    
    if (instError) {
      console.log('Error:', instError.message);
    } else {
      console.log('Columnas disponibles:', Object.keys(instData[0] || {}));
    }

    // Verificar estructura de students
    console.log('Estructura de students:');
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (studentError) {
      console.log('Error:', studentError.message);
    } else {
      console.log('Columnas disponibles:', Object.keys(studentData[0] || {}));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();



