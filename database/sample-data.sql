-- Datos de ejemplo para testing del Sistema de Gestión Educativa
-- Este script debe ejecutarse después de schema.sql y rls-policies.sql

-- Insertar institución de ejemplo
INSERT INTO institutions (id, name, email, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Universidad Tecnológica Nacional', 'info@utn.edu.ar', '+54-11-4567-8900', 'Av. Medrano 951, C1179AAQ CABA, Argentina');

-- Insertar usuarios de ejemplo (estos IDs deben coincidir con los usuarios de Supabase Auth)
-- NOTA: Estos son IDs de ejemplo, en producción deben ser los IDs reales de Supabase Auth
INSERT INTO users (id, institution_id, email, role, first_name, last_name, phone) VALUES
-- Admin de la institución
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'admin@utn.edu.ar', 'admin', 'Juan', 'Administrador', '+54-11-1234-5678'),
-- Profesores
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'profesor1@utn.edu.ar', 'professor', 'María', 'González', '+54-11-2345-6789'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'profesor2@utn.edu.ar', 'professor', 'Carlos', 'Rodríguez', '+54-11-3456-7890'),
-- Estudiantes
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', 'estudiante1@utn.edu.ar', 'student', 'Ana', 'Martínez', '+54-11-4567-8901'),
('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', 'estudiante2@utn.edu.ar', 'student', 'Luis', 'Fernández', '+54-11-5678-9012');

-- Insertar carreras
INSERT INTO careers (id, institution_id, name, description, duration_years) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Ingeniería en Sistemas de Información', 'Carrera de grado en sistemas de información con enfoque en desarrollo de software', 5),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Tecnicatura en Programación', 'Tecnicatura superior en programación y desarrollo de aplicaciones', 3);

-- Insertar ciclos
INSERT INTO cycles (id, career_id, name, year) VALUES
-- Ciclos para Ingeniería en Sistemas (5 años)
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Primer Año', 1),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Segundo Año', 2),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Tercer Año', 3),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Cuarto Año', 4),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Quinto Año', 5),
-- Ciclos para Tecnicatura en Programación (3 años)
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Primer Año', 1),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Segundo Año', 2),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Tercer Año', 3);

-- Insertar materias
INSERT INTO subjects (id, cycle_id, name, code, description, credits, hours_per_week) VALUES
-- Primer Año - Ingeniería en Sistemas
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Análisis Matemático I', 'AM1', 'Cálculo diferencial e integral de una variable', 6, 6),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Álgebra y Geometría Analítica', 'AGA', 'Álgebra lineal y geometría analítica', 6, 6),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Programación I', 'P1', 'Fundamentos de programación', 6, 6),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'Sistemas de Representación', 'SR', 'Dibujo técnico y representación gráfica', 3, 3),
-- Segundo Año - Ingeniería en Sistemas
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'Análisis Matemático II', 'AM2', 'Cálculo diferencial e integral de varias variables', 6, 6),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'Programación II', 'P2', 'Programación orientada a objetos', 6, 6),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'Estructuras de Datos', 'ED', 'Algoritmos y estructuras de datos', 6, 6),
-- Primer Año - Tecnicatura en Programación
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440006', 'Programación Web I', 'PW1', 'Fundamentos de desarrollo web', 4, 4),
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440006', 'Base de Datos I', 'BD1', 'Fundamentos de bases de datos', 4, 4);

-- Insertar asignaciones de profesores a materias
INSERT INTO professor_subjects (professor_id, subject_id) VALUES
('22222222-2222-2222-2222-222222222222', '880e8400-e29b-41d4-a716-446655440001'), -- María González enseña Análisis Matemático I
('22222222-2222-2222-2222-222222222222', '880e8400-e29b-41d4-a716-446655440002'), -- María González enseña Álgebra y Geometría
('33333333-3333-3333-3333-333333333333', '880e8400-e29b-41d4-a716-446655440003'), -- Carlos Rodríguez enseña Programación I
('33333333-3333-3333-3333-333333333333', '880e8400-e29b-41d4-a716-446655440006'), -- Carlos Rodríguez enseña Programación II
('33333333-3333-3333-3333-333333333333', '880e8400-e29b-41d4-a716-446655440008'); -- Carlos Rodríguez enseña Programación Web I

-- Insertar estudiantes
INSERT INTO students (id, user_id, institution_id, career_id, student_number, enrollment_date) VALUES
('990e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '2024001', '2024-03-01'),
('990e8400-e29b-41d4-a716-446655440002', '55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', '2024002', '2024-03-01');

-- Insertar inscripciones a materias
INSERT INTO enrollments (id, student_id, subject_id, enrollment_date, status) VALUES
-- Ana Martínez (Ingeniería en Sistemas - Primer Año)
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2024-03-01', 'enrolled'),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '2024-03-01', 'enrolled'),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440003', '2024-03-01', 'enrolled'),
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', '2024-03-01', 'enrolled'),
-- Luis Fernández (Tecnicatura en Programación - Primer Año)
('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440008', '2024-03-01', 'enrolled'),
('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440009', '2024-03-01', 'enrolled');

-- Insertar calificaciones de ejemplo
INSERT INTO grades (enrollment_id, professor_id, grade, max_grade, grade_type, description) VALUES
-- Calificaciones para Ana Martínez
('aa0e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 85, 100, 'exam', 'Primer Parcial - Análisis Matemático I'),
('aa0e8400-e29b-41d4-a716-446655440002', '22222222-2222-2222-2222-222222222222', 78, 100, 'exam', 'Primer Parcial - Álgebra y Geometría'),
('aa0e8400-e29b-41d4-a716-446655440003', '33333333-3333-3333-3333-333333333333', 92, 100, 'assignment', 'Trabajo Práctico - Programación I'),
-- Calificaciones para Luis Fernández
('aa0e8400-e29b-41d4-a716-446655440005', '33333333-3333-3333-3333-333333333333', 88, 100, 'project', 'Proyecto Final - Programación Web I');

-- Insertar correlatividades
INSERT INTO correlatives (subject_id, required_subject_id) VALUES
-- Análisis Matemático II requiere Análisis Matemático I
('880e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001'),
-- Programación II requiere Programación I
('880e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440003'),
-- Estructuras de Datos requiere Programación I
('880e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440003');
