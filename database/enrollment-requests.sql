-- Script para crear el sistema de solicitudes de inscripción con aprobación
-- Este script debe ejecutarse después de schema.sql y rls-policies.sql

-- Crear tipo de estado para solicitudes de inscripción
CREATE TYPE enrollment_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Tabla de solicitudes de inscripción a materias
CREATE TABLE enrollment_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    academic_year VARCHAR(10) NOT NULL,
    semester INTEGER NOT NULL,
    status enrollment_request_status DEFAULT 'pending',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    student_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, academic_year, semester)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_enrollment_requests_student_id ON enrollment_requests(student_id);
CREATE INDEX idx_enrollment_requests_subject_id ON enrollment_requests(subject_id);
CREATE INDEX idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX idx_enrollment_requests_academic_year ON enrollment_requests(academic_year);
CREATE INDEX idx_enrollment_requests_semester ON enrollment_requests(semester);

-- Políticas RLS para enrollment_requests
-- Los estudiantes pueden ver y crear sus propias solicitudes
CREATE POLICY "Students can view their enrollment requests" ON enrollment_requests
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can create enrollment requests" ON enrollment_requests
    FOR INSERT WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

-- Los estudiantes pueden actualizar sus propias solicitudes solo si están pendientes
CREATE POLICY "Students can update pending enrollment requests" ON enrollment_requests
    FOR UPDATE USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        ) AND status = 'pending'
    );

-- Los estudiantes pueden cancelar sus propias solicitudes
CREATE POLICY "Students can cancel enrollment requests" ON enrollment_requests
    FOR UPDATE USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        ) AND status IN ('pending', 'approved')
    );

-- Los administradores pueden ver todas las solicitudes de su institución
CREATE POLICY "Admins can view all enrollment requests" ON enrollment_requests
    FOR SELECT USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Los administradores pueden gestionar todas las solicitudes de su institución
CREATE POLICY "Admins can manage enrollment requests" ON enrollment_requests
    FOR ALL USING (
        career_id IN (
            SELECT id FROM careers WHERE institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Función para aprobar una solicitud de inscripción
CREATE OR REPLACE FUNCTION approve_enrollment_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
    request_record enrollment_requests%ROWTYPE;
    existing_enrollment UUID;
BEGIN
    -- Obtener la solicitud
    SELECT * INTO request_record FROM enrollment_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de inscripción no encontrada';
    END IF;
    
    -- Verificar que la solicitud esté pendiente
    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar solicitudes pendientes';
    END IF;
    
    -- Verificar que no exista ya una inscripción activa
    SELECT id INTO existing_enrollment 
    FROM enrollments 
    WHERE student_id = request_record.student_id 
    AND subject_id = request_record.subject_id 
    AND status = 'enrolled';
    
    IF existing_enrollment IS NOT NULL THEN
        RAISE EXCEPTION 'El estudiante ya está inscrito en esta materia';
    END IF;
    
    -- Crear la inscripción oficial
    INSERT INTO enrollments (student_id, subject_id, enrollment_date, status)
    VALUES (request_record.student_id, request_record.subject_id, NOW(), 'enrolled');
    
    -- Actualizar el estado de la solicitud
    UPDATE enrollment_requests 
    SET status = 'approved', 
        reviewed_by = auth.uid(),
        reviewed_at = NOW()
    WHERE id = request_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar una solicitud de inscripción
CREATE OR REPLACE FUNCTION reject_enrollment_request(request_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    request_record enrollment_requests%ROWTYPE;
BEGIN
    -- Obtener la solicitud
    SELECT * INTO request_record FROM enrollment_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de inscripción no encontrada';
    END IF;
    
    -- Verificar que la solicitud esté pendiente
    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Solo se pueden rechazar solicitudes pendientes';
    END IF;
    
    -- Actualizar el estado de la solicitud
    UPDATE enrollment_requests 
    SET status = 'rejected', 
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        admin_notes = COALESCE(admin_notes, admin_notes)
    WHERE id = request_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cancelar una solicitud de inscripción (solo estudiantes)
CREATE OR REPLACE FUNCTION cancel_enrollment_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
    request_record enrollment_requests%ROWTYPE;
BEGIN
    -- Obtener la solicitud
    SELECT * INTO request_record FROM enrollment_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de inscripción no encontrada';
    END IF;
    
    -- Verificar que la solicitud pertenezca al usuario actual
    IF request_record.student_id NOT IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No tienes permisos para cancelar esta solicitud';
    END IF;
    
    -- Verificar que la solicitud esté pendiente o aprobada
    IF request_record.status NOT IN ('pending', 'approved') THEN
        RAISE EXCEPTION 'Solo se pueden cancelar solicitudes pendientes o aprobadas';
    END IF;
    
    -- Actualizar el estado de la solicitud
    UPDATE enrollment_requests 
    SET status = 'cancelled'
    WHERE id = request_id;
    
    -- Si estaba aprobada, también eliminar la inscripción
    IF request_record.status = 'approved' THEN
        DELETE FROM enrollments 
        WHERE student_id = request_record.student_id 
        AND subject_id = request_record.subject_id 
        AND status = 'enrolled';
    END IF;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener solicitudes de inscripción con información completa
CREATE OR REPLACE FUNCTION get_enrollment_requests_with_details(
    p_status enrollment_request_status DEFAULT NULL,
    p_student_id UUID DEFAULT NULL,
    p_academic_year VARCHAR DEFAULT NULL,
    p_semester INTEGER DEFAULT NULL
)
RETURNS TABLE (
    request_id UUID,
    student_id UUID,
    student_name TEXT,
    student_number VARCHAR,
    subject_id UUID,
    subject_name VARCHAR,
    subject_code VARCHAR,
    career_id UUID,
    career_name VARCHAR,
    cycle_id UUID,
    cycle_name VARCHAR,
    academic_year VARCHAR,
    semester INTEGER,
    status enrollment_request_status,
    request_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    reviewed_by_name TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    student_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.student_id,
        CONCAT(u.first_name, ' ', u.last_name),
        s.student_number,
        er.subject_id,
        sub.name,
        sub.code,
        er.career_id,
        c.name,
        er.cycle_id,
        cy.name,
        er.academic_year,
        er.semester,
        er.status,
        er.request_date,
        er.reviewed_by,
        CASE 
            WHEN er.reviewed_by IS NOT NULL THEN CONCAT(ru.first_name, ' ', ru.last_name)
            ELSE NULL
        END,
        er.reviewed_at,
        er.admin_notes,
        er.student_notes,
        er.created_at,
        er.updated_at
    FROM enrollment_requests er
    JOIN students s ON er.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN subjects sub ON er.subject_id = sub.id
    JOIN careers c ON er.career_id = c.id
    JOIN cycles cy ON er.cycle_id = cy.id
    LEFT JOIN users ru ON er.reviewed_by = ru.id
    WHERE 
        (p_status IS NULL OR er.status = p_status)
        AND (p_student_id IS NULL OR er.student_id = p_student_id)
        AND (p_academic_year IS NULL OR er.academic_year = p_academic_year)
        AND (p_semester IS NULL OR er.semester = p_semester)
        AND c.institution_id = get_user_institution_id()
    ORDER BY er.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
