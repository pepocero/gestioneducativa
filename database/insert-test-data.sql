-- Script para insertar las materias de prueba que mencionaste

-- Primero, vamos a encontrar los IDs de las carreras y ciclos
-- (Esto asume que las carreras "Ingenieria de Sistemas" e "Ingenieria Quimica" ya existen)

-- Insertar Matemáticas 1 para Ingenieria de Sistemas - Primer año
INSERT INTO subjects (name, code, credits, cycle_id, description, is_active)
SELECT 
    'Matematicas 1',
    'MAT101',
    4,
    cy.id,
    'Matemáticas básicas para ingeniería de sistemas',
    true
FROM cycles cy
JOIN careers c ON cy.career_id = c.id
WHERE c.name = 'Ingenieria de Sistemas' 
  AND cy.name = 'Primer año';

-- Insertar Química Básica para Ingenieria Quimica - Primer año
INSERT INTO subjects (name, code, credits, cycle_id, description, is_active)
SELECT 
    'Quimica Basica',
    'QUI101',
    3,
    cy.id,
    'Química básica para ingeniería química',
    true
FROM cycles cy
JOIN careers c ON cy.career_id = c.id
WHERE c.name = 'Ingenieria Quimica' 
  AND cy.name = 'Primer año';

-- Verificar que se insertaron correctamente
SELECT 
    'VERIFICACION' as info,
    s.name as materia,
    s.code,
    cy.name as ciclo,
    c.name as carrera
FROM subjects s
JOIN cycles cy ON s.cycle_id = cy.id
JOIN careers c ON cy.career_id = c.id
WHERE s.name IN ('Matematicas 1', 'Quimica Basica');



