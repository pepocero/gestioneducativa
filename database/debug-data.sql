-- Script para verificar los datos y debuggear el problema de materias

-- 1. Verificar carreras
SELECT 'CARRERAS' as tabla, id, name FROM careers ORDER BY name;

-- 2. Verificar ciclos
SELECT 'CICLOS' as tabla, id, name, year, career_id FROM cycles ORDER BY career_id, year;

-- 3. Verificar materias
SELECT 'MATERIAS' as tabla, id, name, code, cycle_id FROM subjects ORDER BY cycle_id, code;

-- 4. Verificar la relación completa carrera -> ciclo -> materia
SELECT 
    c.name as carrera,
    cy.name as ciclo,
    cy.year,
    s.name as materia,
    s.code
FROM careers c
LEFT JOIN cycles cy ON c.id = cy.career_id
LEFT JOIN subjects s ON cy.id = s.cycle_id
ORDER BY c.name, cy.year, s.code;

-- 5. Verificar específicamente los ciclos que aparecen en los logs
SELECT 
    'CICLO ESPECIFICO' as info,
    cy.id,
    cy.name,
    cy.year,
    cy.career_id,
    c.name as carrera_nombre
FROM cycles cy
JOIN careers c ON cy.career_id = c.id
WHERE cy.id IN (
    '6f33116c-23c0-4dda-91ee-ab640adf37c1',
    '4d258ad1-5920-405e-8cc8-260a7e317a39'
);

-- 6. Verificar si hay materias para esos ciclos específicos
SELECT 
    'MATERIAS DEL CICLO' as info,
    s.id,
    s.name,
    s.code,
    s.cycle_id,
    cy.name as ciclo_nombre
FROM subjects s
JOIN cycles cy ON s.cycle_id = cy.id
WHERE s.cycle_id IN (
    '6f33116c-23c0-4dda-91ee-ab640adf37c1',
    '4d258ad1-5920-405e-8cc8-260a7e317a39'
);



