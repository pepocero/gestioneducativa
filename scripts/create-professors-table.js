const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProfessorsTable() {
  console.log('Creando tabla de profesores...');
  
  try {
    // Intentar crear la tabla usando una consulta directa
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('La tabla professors no existe, necesitamos crearla manualmente');
      console.log('Por favor, ejecuta este SQL en el editor de Supabase:');
      console.log('');
      console.log('CREATE TABLE professors (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,');
      console.log('  first_name VARCHAR(100) NOT NULL,');
      console.log('  last_name VARCHAR(100) NOT NULL,');
      console.log('  email VARCHAR(255) UNIQUE NOT NULL,');
      console.log('  phone VARCHAR(20),');
      console.log('  dni VARCHAR(20) UNIQUE,');
      console.log('  birth_date DATE,');
      console.log('  address TEXT,');
      console.log('  specialization VARCHAR(100),');
      console.log('  degree VARCHAR(100),');
      console.log('  experience_years INTEGER,');
      console.log('  hire_date DATE,');
      console.log('  salary DECIMAL(10,2),');
      console.log('  emergency_contact VARCHAR(100),');
      console.log('  emergency_phone VARCHAR(20),');
      console.log('  status VARCHAR(20) DEFAULT \'active\',');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
      console.log(');');
      console.log('');
      console.log('-- Habilitar RLS');
      console.log('ALTER TABLE professors ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Crear políticas básicas');
      console.log('CREATE POLICY "Enable read access for all users" ON professors FOR SELECT USING (true);');
      console.log('CREATE POLICY "Enable insert for authenticated users" ON professors FOR INSERT WITH CHECK (true);');
      console.log('CREATE POLICY "Enable update for authenticated users" ON professors FOR UPDATE USING (true);');
      console.log('CREATE POLICY "Enable delete for authenticated users" ON professors FOR DELETE USING (true);');
    } else if (error) {
      console.log('Error verificando tabla:', error.message);
    } else {
      console.log('La tabla professors ya existe!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createProfessorsTable();





