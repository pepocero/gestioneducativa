console.log('🏫 SCRIPT PARA CREAR INSTITUCIONES DE PRUEBA\n');

console.log('📋 INSTRUCCIONES:');
console.log('1. Ve a tu panel de Supabase: https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a "SQL Editor" en el menú lateral');
console.log('4. Copia y pega el siguiente SQL:');
console.log('');

console.log('-- SQL para crear instituciones de prueba');
console.log('INSERT INTO institutions (name, email, phone, address) VALUES');
console.log('(');
console.log("  'Universidad Nacional',");
console.log("  'contacto@un.edu',");
console.log("  '+54 11 1234-5678',");
console.log("  'Av. Principal 123, Ciudad, País'");
console.log('),');
console.log('(');
console.log("  'Instituto Superior Tecnológico',");
console.log("  'info@ist.edu',");
console.log("  '+54 11 9876-5432',");
console.log("  'Calle Tecnológica 456, Ciudad, País'");
console.log('),');
console.log('(');
console.log("  'Colegio Modelo',");
console.log("  'admin@colegiomodelo.com',");
console.log("  '+54 11 2345-6789',");
console.log("  'Plaza Central 789, Ciudad, País'");
console.log(');');

console.log('\n5. Haz clic en "Run" para ejecutar el SQL');
console.log('6. Verifica que las instituciones se crearon correctamente');

console.log('\n🎯 DESPUÉS DE CREAR LAS INSTITUCIONES:');
console.log('• Ve a /admin/institutions');
console.log('• Deberías ver las 3 instituciones creadas');
console.log('• Haz clic en "Ver Detalles" de cualquier institución');
console.log('• Cada institución mostrará sus propios datos únicos');

console.log('\n✨ ¡PROBLEMA SOLUCIONADO!');
console.log('Ahora cada institución tendrá sus propios datos únicos.');

