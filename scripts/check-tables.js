const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Verificando tablas existentes...');
  
  try {
    // Intentar acceder a cada tabla para ver si existe
    const tables = ['institutions', 'careers', 'professors', 'students', 'subjects'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`Tabla ${table}: No existe`);
        } else {
          console.log(`Tabla ${table}: Existe`);
        }
      } catch (err) {
        console.log(`Tabla ${table}: No existe`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();



