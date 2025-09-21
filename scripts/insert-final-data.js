const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqxrhrwiasewfvasems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5Njk2OSwiZXhwIjoyMDczNzcyOTY5fQ.jMa4iEvjjmN2VDhT-j7vWQhLMVn1aJ0CEiRzXDVJPGs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleData() {
  console.log('Insertando datos de prueba con estructura correcta...');
  
  try {
    // 1. Insertar institución de prueba
    console.log('Insertando institución...');
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .insert([
        {
          name: 'Universidad Nacional',
          email: 'contacto@un.edu',
          phone: '+54 11 1234-5678',
          address: 'Av. Principal 123, Ciudad, País'
        }
      ])
      .select();

    if (instError) {
      console.log('Error insertando institución:', instError.message);
      return;
    } else {
      console.log('Institución insertada:', institution[0].id);
    }

    // 2. Insertar carrera de prueba
    console.log('Insertando carrera...');
    const { data: career, error: careerError } = await supabase
      .from('careers')
      .insert([
        {
          institution_id: institution[0].id,
          name: 'Ingeniería en Sistemas',
          description: 'Carrera de ingeniería enfocada en sistemas informáticos',
          duration_years: 5,
          is_active: true
        }
      ])
      .select();

    if (careerError) {
      console.log('Error insertando carrera:', careerError.message);
      return;
    } else {
      console.log('Carrera insertada:', career[0].id);
    }

    // 3. Insertar estudiante de prueba
    console.log('Insertando estudiante...');
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          institution_id: institution[0].id,
          career_id: career[0].id,
          student_number: '2024001',
          enrollment_date: '2024-01-15',
          is_active: true
        }
      ])
      .select();

    if (studentError) {
      console.log('Error insertando estudiante:', studentError.message);
      return;
    } else {
      console.log('Estudiante insertado:', student[0].id);
    }

    // 4. Insertar materia de prueba
    console.log('Insertando materia...');
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert([
        {
          career_id: career[0].id,
          name: 'Programación I',
          description: 'Introducción a la programación',
          year: 1,
          credits: 6
        }
      ])
      .select();

    if (subjectError) {
      console.log('Error insertando materia:', subjectError.message);
      return;
    } else {
      console.log('Materia insertada:', subject[0].id);
    }

    console.log('Datos de prueba insertados exitosamente!');

  } catch (error) {
    console.error('Error general:', error);
  }
}

insertSampleData();


