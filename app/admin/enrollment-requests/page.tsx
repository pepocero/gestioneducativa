'use client'

import { EnrollmentApprovalPanel } from '@/components/admin/EnrollmentApprovalPanel'

export default function AdminEnrollmentRequestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Inscripciones</h1>
        <p className="text-gray-600">
          Revisa y aprueba las solicitudes de inscripción a materias de los estudiantes.
        </p>
      </div>

      <EnrollmentApprovalPanel />
    </div>
  )
}
