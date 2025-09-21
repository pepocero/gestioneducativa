-- Script SQL para implementar el Flujo 2: Materias independientes con asignación a ciclos
-- Este script debe ejecutarse en Supabase SQL Editor

-- Primero, modificar la tabla subjects para que no dependa directamente de cycles
-- Crear nueva tabla subjects independiente
CREATE TABLE IF NOT EXISTS subjects_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL DEFAULT 3,
    hours_per_week INTEGER NOT NULL DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Crear tabla de asignación de materias a ciclos
CREATE TABLE IF NOT EXISTS cycle_subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects_new(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    semester INTEGER CHECK (semester IN (1, 2)), -- 1 = primer semestre, 2 = segundo semestre
    order_in_cycle INTEGER DEFAULT 1, -- Orden dentro del ciclo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cycle_id, subject_id)
);

-- Crear tabla de correlatividades (materias que deben aprobarse antes)
CREATE TABLE IF NOT EXISTS subject_prerequisites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES subjects_new(id) ON DELETE CASCADE,
    prerequisite_subject_id UUID NOT NULL REFERENCES subjects_new(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, prerequisite_subject_id),
    CHECK (subject_id != prerequisite_subject_id) -- Evitar correlatividad consigo misma
);

-- Migrar datos existentes si los hay
-- (Solo ejecutar si ya tienes datos en la tabla subjects actual)
DO $$
BEGIN
    -- Verificar si existe la tabla subjects actual
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        -- Migrar datos de subjects a subjects_new
        INSERT INTO subjects_new (id, institution_id, name, code, description, credits, hours_per_week, is_active, created_at, updated_at)
        SELECT 
            s.id,
            c.institution_id,
            s.name,
            s.code,
            s.description,
            s.credits,
            s.hours_per_week,
            s.is_active,
            s.created_at,
            s.updated_at
        FROM subjects s
        JOIN cycles cy ON s.cycle_id = cy.id
        JOIN careers c ON cy.career_id = c.id
        ON CONFLICT (id) DO NOTHING;
        
        -- Crear asignaciones en cycle_subjects
        INSERT INTO cycle_subjects (cycle_id, subject_id, is_required, semester, order_in_cycle)
        SELECT 
            s.cycle_id,
            s.id,
            TRUE, -- Por defecto todas son requeridas
            1,    -- Por defecto primer semestre
            ROW_NUMBER() OVER (PARTITION BY s.cycle_id ORDER BY s.created_at)
        FROM subjects s
        ON CONFLICT (cycle_id, subject_id) DO NOTHING;
        
        RAISE NOTICE 'Datos migrados exitosamente de subjects a subjects_new';
    END IF;
END $$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_subjects_new_institution ON subjects_new(institution_id);
CREATE INDEX IF NOT EXISTS idx_subjects_new_code ON subjects_new(institution_id, code);
CREATE INDEX IF NOT EXISTS idx_cycle_subjects_cycle ON cycle_subjects(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_subjects_subject ON cycle_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_prerequisites_subject ON subject_prerequisites(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_prerequisites_prerequisite ON subject_prerequisites(prerequisite_subject_id);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE subjects_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_prerequisites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subjects_new
CREATE POLICY "Users can view subjects from their institution" ON subjects_new
    FOR SELECT USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage subjects" ON subjects_new
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id 
            FROM users 
            WHERE id = auth.uid()
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Políticas RLS para cycle_subjects
CREATE POLICY "Users can view cycle subjects from their institution" ON cycle_subjects
    FOR SELECT USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage cycle subjects" ON cycle_subjects
    FOR ALL USING (
        cycle_id IN (
            SELECT c.id 
            FROM cycles c
            JOIN careers ca ON c.career_id = ca.id
            JOIN users u ON ca.institution_id = u.institution_id
            WHERE u.id = auth.uid()
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Políticas RLS para subject_prerequisites
CREATE POLICY "Users can view prerequisites from their institution" ON subject_prerequisites
    FOR SELECT USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage prerequisites" ON subject_prerequisites
    FOR ALL USING (
        subject_id IN (
            SELECT id 
            FROM subjects_new 
            WHERE institution_id IN (
                SELECT institution_id 
                FROM users 
                WHERE id = auth.uid()
            )
        ) AND (
            SELECT role = 'admin' 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Función para obtener materias de un ciclo específico
CREATE OR REPLACE FUNCTION get_subjects_by_cycle(p_cycle_id UUID)
RETURNS TABLE (
    subject_id UUID,
    subject_name VARCHAR,
    subject_code VARCHAR,
    credits INTEGER,
    hours_per_week INTEGER,
    is_required BOOLEAN,
    semester INTEGER,
    order_in_cycle INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.code,
        s.credits,
        s.hours_per_week,
        cs.is_required,
        cs.semester,
        cs.order_in_cycle
    FROM cycle_subjects cs
    JOIN subjects_new s ON cs.subject_id = s.id
    WHERE cs.cycle_id = p_cycle_id
    ORDER BY cs.semester, cs.order_in_cycle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener ciclos de una materia específica
CREATE OR REPLACE FUNCTION get_cycles_by_subject(p_subject_id UUID)
RETURNS TABLE (
    cycle_id UUID,
    cycle_name VARCHAR,
    year INTEGER,
    career_name VARCHAR,
    is_required BOOLEAN,
    semester INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.year,
        ca.name,
        cs.is_required,
        cs.semester
    FROM cycle_subjects cs
    JOIN cycles c ON cs.cycle_id = c.id
    JOIN careers ca ON c.career_id = ca.id
    WHERE cs.subject_id = p_subject_id
    ORDER BY ca.name, c.year, cs.semester;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para asignar materia a ciclo
CREATE OR REPLACE FUNCTION assign_subject_to_cycle(
    p_cycle_id UUID,
    p_subject_id UUID,
    p_is_required BOOLEAN DEFAULT TRUE,
    p_semester INTEGER DEFAULT 1,
    p_order INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_institution_id UUID;
BEGIN
    -- Verificar que el usuario es admin de la institución
    SELECT ca.institution_id INTO v_institution_id
    FROM cycles c
    JOIN careers ca ON c.career_id = ca.id
    WHERE c.id = p_cycle_id
    AND ca.institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
    
    IF v_institution_id IS NULL THEN
        RAISE EXCEPTION 'No tienes permisos para asignar materias a este ciclo';
    END IF;
    
    -- Verificar que la materia pertenece a la misma institución
    IF NOT EXISTS (
        SELECT 1 FROM subjects_new 
        WHERE id = p_subject_id 
        AND institution_id = v_institution_id
    ) THEN
        RAISE EXCEPTION 'La materia no pertenece a tu institución';
    END IF;
    
    -- Insertar asignación
    INSERT INTO cycle_subjects (cycle_id, subject_id, is_required, semester, order_in_cycle)
    VALUES (p_cycle_id, p_subject_id, p_is_required, p_semester, p_order)
    ON CONFLICT (cycle_id, subject_id) DO UPDATE SET
        is_required = EXCLUDED.is_required,
        semester = EXCLUDED.semester,
        order_in_cycle = EXCLUDED.order_in_cycle;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para desasignar materia de ciclo
CREATE OR REPLACE FUNCTION unassign_subject_from_cycle(
    p_cycle_id UUID,
    p_subject_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_institution_id UUID;
BEGIN
    -- Verificar permisos
    SELECT ca.institution_id INTO v_institution_id
    FROM cycles c
    JOIN careers ca ON c.career_id = ca.id
    WHERE c.id = p_cycle_id
    AND ca.institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
    
    IF v_institution_id IS NULL THEN
        RAISE EXCEPTION 'No tienes permisos para desasignar materias de este ciclo';
    END IF;
    
    -- Eliminar asignación
    DELETE FROM cycle_subjects 
    WHERE cycle_id = p_cycle_id AND subject_id = p_subject_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE subjects_new IS 'Materias independientes de la institución';
COMMENT ON TABLE cycle_subjects IS 'Asignación de materias a ciclos específicos';
COMMENT ON TABLE subject_prerequisites IS 'Correlatividades entre materias';
COMMENT ON FUNCTION get_subjects_by_cycle(UUID) IS 'Obtiene todas las materias asignadas a un ciclo';
COMMENT ON FUNCTION get_cycles_by_subject(UUID) IS 'Obtiene todos los ciclos donde está asignada una materia';
COMMENT ON FUNCTION assign_subject_to_cycle(UUID, UUID, BOOLEAN, INTEGER, INTEGER) IS 'Asigna una materia a un ciclo';
COMMENT ON FUNCTION unassign_subject_from_cycle(UUID, UUID) IS 'Desasigna una materia de un ciclo';
