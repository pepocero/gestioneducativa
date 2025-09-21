-- Script para arreglar las políticas RLS de la tabla careers
-- Este script debe ejecutarse en Supabase SQL Editor

-- Primero, habilitar RLS en la tabla careers si no está habilitado
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view careers from their institution" ON careers;
DROP POLICY IF EXISTS "Users can insert careers to their institution" ON careers;
DROP POLICY IF EXISTS "Users can update careers from their institution" ON careers;
DROP POLICY IF EXISTS "Users can delete careers from their institution" ON careers;

-- Crear políticas RLS para careers
-- Política para SELECT: Los usuarios pueden ver carreras de su institución
CREATE POLICY "Users can view careers from their institution" ON careers
    FOR SELECT
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Política para INSERT: Los usuarios pueden crear carreras en su institución
CREATE POLICY "Users can insert careers to their institution" ON careers
    FOR INSERT
    WITH CHECK (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Política para UPDATE: Los usuarios pueden actualizar carreras de su institución
CREATE POLICY "Users can update careers from their institution" ON careers
    FOR UPDATE
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Política para DELETE: Los usuarios pueden eliminar carreras de su institución
CREATE POLICY "Users can delete careers from their institution" ON careers
    FOR DELETE
    USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- También crear políticas para la tabla cycles
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de cycles
DROP POLICY IF EXISTS "Users can view cycles from their institution" ON cycles;
DROP POLICY IF EXISTS "Users can insert cycles to their institution" ON cycles;
DROP POLICY IF EXISTS "Users can update cycles from their institution" ON cycles;
DROP POLICY IF EXISTS "Users can delete cycles from their institution" ON cycles;

-- Crear políticas RLS para cycles
CREATE POLICY "Users can view cycles from their institution" ON cycles
    FOR SELECT
    USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cycles to their institution" ON cycles
    FOR INSERT
    WITH CHECK (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can update cycles from their institution" ON cycles
    FOR UPDATE
    USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    )
    WITH CHECK (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete cycles from their institution" ON cycles
    FOR DELETE
    USING (
        career_id IN (
            SELECT c.id 
            FROM careers c
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

-- También crear políticas para la tabla subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de subjects
DROP POLICY IF EXISTS "Users can view subjects from their institution" ON subjects;
DROP POLICY IF EXISTS "Users can insert subjects to their institution" ON subjects;
DROP POLICY IF EXISTS "Users can update subjects from their institution" ON subjects;
DROP POLICY IF EXISTS "Users can delete subjects from their institution" ON subjects;

-- Crear políticas RLS para subjects
CREATE POLICY "Users can view subjects from their institution" ON subjects
    FOR SELECT
    USING (
        cycle_id IN (
            SELECT cy.id 
            FROM cycles cy
            JOIN careers c ON cy.career_id = c.id
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subjects to their institution" ON subjects
    FOR INSERT
    WITH CHECK (
        cycle_id IN (
            SELECT cy.id 
            FROM cycles cy
            JOIN careers c ON cy.career_id = c.id
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can update subjects from their institution" ON subjects
    FOR UPDATE
    USING (
        cycle_id IN (
            SELECT cy.id 
            FROM cycles cy
            JOIN careers c ON cy.career_id = c.id
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    )
    WITH CHECK (
        cycle_id IN (
            SELECT cy.id 
            FROM cycles cy
            JOIN careers c ON cy.career_id = c.id
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subjects from their institution" ON subjects
    FOR DELETE
    USING (
        cycle_id IN (
            SELECT cy.id 
            FROM cycles cy
            JOIN careers c ON cy.career_id = c.id
            JOIN users u ON c.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );
