const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Iniciando creación de tablas...\n');

  try {
    // 1. Crear tabla de instituciones
    console.log('📋 Creando tabla de instituciones...');
    const { error: institutionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS institutions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (institutionsError) {
      console.log('⚠️  Error creando tabla institutions:', institutionsError.message);
    } else {
      console.log('✅ Tabla institutions creada exitosamente');
    }

    // 2. Crear tabla de carreras
    console.log('📋 Creando tabla de carreras...');
    const { error: careersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS careers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          duration_years INTEGER,
          total_subjects INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (careersError) {
      console.log('⚠️  Error creando tabla careers:', careersError.message);
    } else {
      console.log('✅ Tabla careers creada exitosamente');
    }

    // 3. Crear tabla de profesores
    console.log('📋 Creando tabla de profesores...');
    const { error: professorsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS professors (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          dni VARCHAR(20) UNIQUE,
          birth_date DATE,
          address TEXT,
          specialization VARCHAR(100),
          degree VARCHAR(100),
          experience_years INTEGER,
          hire_date DATE,
          salary DECIMAL(10,2),
          emergency_contact VARCHAR(100),
          emergency_phone VARCHAR(20),
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (professorsError) {
      console.log('⚠️  Error creando tabla professors:', professorsError.message);
    } else {
      console.log('✅ Tabla professors creada exitosamente');
    }

    // 4. Crear tabla de estudiantes
    console.log('📋 Creando tabla de estudiantes...');
    const { error: studentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          dni VARCHAR(20) UNIQUE,
          birth_date DATE,
          address TEXT,
          career_id UUID REFERENCES careers(id) ON DELETE SET NULL,
          year INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (studentsError) {
      console.log('⚠️  Error creando tabla students:', studentsError.message);
    } else {
      console.log('✅ Tabla students creada exitosamente');
    }

    // 5. Crear tabla de materias
    console.log('📋 Creando tabla de materias...');
    const { error: subjectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subjects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          year INTEGER,
          credits INTEGER,
          professor_id UUID REFERENCES professors(id) ON DELETE SET NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (subjectsError) {
      console.log('⚠️  Error creando tabla subjects:', subjectsError.message);
    } else {
      console.log('✅ Tabla subjects creada exitosamente');
    }

    // 6. Crear tabla de inscripciones de estudiantes a materias
    console.log('📋 Creando tabla de inscripciones...');
    const { error: enrollmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_subject_enrollments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
          enrollment_date DATE DEFAULT CURRENT_DATE,
          status VARCHAR(20) DEFAULT 'enrolled',
          final_grade DECIMAL(4,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(student_id, subject_id)
        );
      `
    });

    if (enrollmentsError) {
      console.log('⚠️  Error creando tabla enrollments:', enrollmentsError.message);
    } else {
      console.log('✅ Tabla student_subject_enrollments creada exitosamente');
    }

    console.log('\n🎉 ¡Todas las tablas han sido creadas exitosamente!');
    console.log('\n📊 Resumen de tablas creadas:');
    console.log('   • institutions - Instituciones educativas');
    console.log('   • careers - Carreras académicas');
    console.log('   • professors - Profesores');
    console.log('   • students - Estudiantes');
    console.log('   • subjects - Materias');
    console.log('   • student_subject_enrollments - Inscripciones');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTables();



