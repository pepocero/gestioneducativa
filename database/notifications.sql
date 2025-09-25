-- Script para crear el sistema de notificaciones
-- Este script debe ejecutarse después de enrollment-requests.sql

-- Crear tipo de notificación
CREATE TYPE notification_type AS ENUM (
  'enrollment_approved', 
  'enrollment_rejected', 
  'enrollment_pending',
  'enrollment_cancelled'
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_request_id UUID REFERENCES enrollment_requests(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Políticas RLS para notifications
-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden marcar como leídas sus propias notificaciones
CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Los administradores pueden crear notificaciones para usuarios de su institución
CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE institution_id = get_user_institution_id()
        ) AND is_institution_admin()
    );

-- Función para crear notificación de aprobación de inscripción
CREATE OR REPLACE FUNCTION create_enrollment_approved_notification(
    p_student_id UUID,
    p_enrollment_request_id UUID
)
RETURNS VOID AS $$
DECLARE
    student_user_id UUID;
    subject_name VARCHAR;
    career_name VARCHAR;
BEGIN
    -- Obtener el user_id del estudiante
    SELECT user_id INTO student_user_id 
    FROM students 
    WHERE id = p_student_id;
    
    -- Obtener información de la materia y carrera
    SELECT 
        s.name,
        c.name
    INTO subject_name, career_name
    FROM enrollment_requests er
    JOIN subjects s ON er.subject_id = s.id
    JOIN careers c ON er.career_id = c.id
    WHERE er.id = p_enrollment_request_id;
    
    -- Crear la notificación
    INSERT INTO notifications (type, title, message, user_id, enrollment_request_id)
    VALUES (
        'enrollment_approved',
        'Inscripción Aprobada',
        'Tu solicitud de inscripción a la materia "' || subject_name || '" de la carrera "' || career_name || '" ha sido aprobada.',
        student_user_id,
        p_enrollment_request_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación de rechazo de inscripción
CREATE OR REPLACE FUNCTION create_enrollment_rejected_notification(
    p_student_id UUID,
    p_enrollment_request_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    student_user_id UUID;
    subject_name VARCHAR;
    career_name VARCHAR;
    notification_message TEXT;
BEGIN
    -- Obtener el user_id del estudiante
    SELECT user_id INTO student_user_id 
    FROM students 
    WHERE id = p_student_id;
    
    -- Obtener información de la materia y carrera
    SELECT 
        s.name,
        c.name
    INTO subject_name, career_name
    FROM enrollment_requests er
    JOIN subjects s ON er.subject_id = s.id
    JOIN careers c ON er.career_id = c.id
    WHERE er.id = p_enrollment_request_id;
    
    -- Crear el mensaje de notificación
    notification_message := 'Tu solicitud de inscripción a la materia "' || subject_name || '" de la carrera "' || career_name || '" ha sido rechazada.';
    
    IF p_admin_notes IS NOT NULL AND p_admin_notes != '' THEN
        notification_message := notification_message || ' Motivo: ' || p_admin_notes;
    END IF;
    
    -- Crear la notificación
    INSERT INTO notifications (type, title, message, user_id, enrollment_request_id)
    VALUES (
        'enrollment_rejected',
        'Inscripción Rechazada',
        notification_message,
        student_user_id,
        p_enrollment_request_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación de solicitud pendiente (para administradores)
CREATE OR REPLACE FUNCTION create_enrollment_pending_notification(
    p_enrollment_request_id UUID
)
RETURNS VOID AS $$
DECLARE
    admin_users UUID[];
    student_name VARCHAR;
    subject_name VARCHAR;
    career_name VARCHAR;
    admin_user_id UUID;
BEGIN
    -- Obtener información de la solicitud
    SELECT 
        CONCAT(u.first_name, ' ', u.last_name),
        s.name,
        c.name,
        c.institution_id
    INTO student_name, subject_name, career_name, admin_users
    FROM enrollment_requests er
    JOIN students st ON er.student_id = st.id
    JOIN users u ON st.user_id = u.id
    JOIN subjects s ON er.subject_id = s.id
    JOIN careers c ON er.career_id = c.id
    WHERE er.id = p_enrollment_request_id;
    
    -- Obtener todos los administradores de la institución
    SELECT ARRAY_AGG(id) INTO admin_users
    FROM users
    WHERE institution_id = (SELECT institution_id FROM careers WHERE id = (SELECT career_id FROM enrollment_requests WHERE id = p_enrollment_request_id))
    AND role = 'admin';
    
    -- Crear notificaciones para cada administrador
    IF admin_users IS NOT NULL THEN
        FOREACH admin_user_id IN ARRAY admin_users
        LOOP
            INSERT INTO notifications (type, title, message, user_id, enrollment_request_id)
            VALUES (
                'enrollment_pending',
                'Nueva Solicitud de Inscripción',
                'El estudiante "' || student_name || '" ha solicitado inscripción a la materia "' || subject_name || '" de la carrera "' || career_name || '".',
                admin_user_id,
                p_enrollment_request_id
            );
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar las funciones de aprobación y rechazo para incluir notificaciones
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
    
    -- Crear notificación de aprobación
    PERFORM create_enrollment_approved_notification(request_record.student_id, request_id);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar función de rechazo
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
    
    -- Crear notificación de rechazo
    PERFORM create_enrollment_rejected_notification(request_record.student_id, request_id, admin_notes);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear notificación cuando se crea una solicitud de inscripción
CREATE OR REPLACE FUNCTION notify_enrollment_request_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear notificación para administradores
    PERFORM create_enrollment_pending_notification(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enrollment_request_created
    AFTER INSERT ON enrollment_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_enrollment_request_created();
