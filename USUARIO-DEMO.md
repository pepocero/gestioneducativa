# 🎯 Usuario de Prueba - Sistema de Gestión Educativa

## 📋 Información del Usuario Demo

**Email:** `demo@educacion.com`  
**Contraseña:** `demo123456`  
**Rol:** Administrador  
**Nombre:** Usuario Demo  

---

## 🚀 Cómo Acceder al Sistema

### Paso 1: Ejecutar Scripts SQL
1. Ve a tu proyecto en **Supabase**
2. Abre el **SQL Editor**
3. **Primero:** Copia y pega el contenido del archivo `database/create-test-user.sql` y ejecuta
4. **Segundo:** Copia y pega el contenido del archivo `database/create-sample-data.sql` y ejecuta

### Paso 2: Configurar Autenticación
1. Ve a **Authentication** → **Users** en Supabase
2. Busca el usuario `demo@educacion.com`
3. Si no existe, créalo manualmente:
   - **Email:** `demo@educacion.com`
   - **Contraseña:** `demo123456`
   - **Confirmar:** `true`

### Paso 3: Acceder al Sistema
1. Ve a tu aplicación: `http://localhost:3000`
2. Haz click en **"Iniciar Sesión"**
3. Usa las credenciales:
   - **Email:** `demo@educacion.com`
   - **Contraseña:** `demo123456`

---

## 🎓 Funcionalidades Disponibles

Como **Administrador**, tendrás acceso completo a:

### 🏢 Gestión de Instituciones
- ✅ Ver todas las instituciones
- ✅ Crear nuevas instituciones
- ✅ Editar información de instituciones
- ✅ Administrar cada institución individualmente

### 👥 Gestión de Usuarios
- ✅ Ver todos los usuarios del sistema
- ✅ Crear nuevos usuarios (estudiantes, profesores, admins)
- ✅ Editar información de usuarios
- ✅ Cambiar roles de usuarios

### 🎯 Panel de Institución (Al hacer click en "Administrar")
- ✅ **Estudiantes**: Crear, editar, eliminar estudiantes
- ✅ **Profesores**: Crear, editar, eliminar profesores
- ✅ **Carreras**: Crear, editar, eliminar carreras
- ✅ **Materias**: Crear, editar, eliminar materias
- ✅ **Ciclos**: Crear, editar, eliminar ciclos
- ✅ **Inscripciones**: Gestionar inscripciones de estudiantes

---

## 🧪 Casos de Prueba Recomendados

### 1. Crear una Institución Nueva
1. Ve a **Instituciones** → **Nueva Institución**
2. Completa el formulario
3. Verifica que aparezca en la lista

### 2. Administrar una Institución
1. Click en **"Administrar"** en cualquier institución
2. Navega por todas las pestañas:
   - **Estudiantes**: Crear un estudiante de prueba
   - **Profesores**: Crear un profesor de prueba
   - **Carreras**: Crear una carrera de prueba
   - **Materias**: Crear una materia de prueba
   - **Ciclos**: Crear un ciclo de prueba
   - **Inscripciones**: Crear una solicitud de inscripción

### 3. Probar Funcionalidades de Inscripciones
1. Ve a la pestaña **"Inscripciones"**
2. Click en **"Nueva Solicitud"**
3. Completa el formulario
4. Prueba los botones de estado:
   - **Aprobar** / **Rechazar** (estado pendiente)
   - **Inscribir** (estado aprobada)
   - **Editar** estado manualmente
   - **Eliminar** inscripción

### 4. Probar Gestión de Usuarios
1. Ve a **Usuarios**
2. Crea diferentes tipos de usuarios:
   - Estudiante
   - Profesor
   - Administrador
3. Verifica que cada uno tenga los permisos correctos

### 5. Probar con Datos de Ejemplo Incluidos
1. **Administrar Universidad Demo**:
   - Click en "Administrar" en "Universidad Demo"
   - Verifica que aparezcan las materias "Programación I" y "Matemáticas I"
   - Verifica que aparezca el estudiante "Ana Estudiante Demo"
   - Verifica que aparezca el profesor "Carlos Profesor Demo"

2. **Probar Inscripciones**:
   - Ve a la pestaña "Inscripciones"
   - Deberías ver una inscripción pendiente de Ana en Programación I
   - Prueba los botones "Aprobar" o "Rechazar"
   - Prueba el botón "Editar" para cambiar el estado

3. **Crear Nuevos Datos**:
   - Crea un nuevo estudiante
   - Crea una nueva materia
   - Crea una nueva inscripción

---

## 🔧 Datos de Prueba Incluidos

El usuario demo tendrá acceso a:
- ✅ **Institución Demo**: "Universidad Demo"
- ✅ **Carrera**: "Ingeniería en Sistemas" (5 años)
- ✅ **Ciclo**: "Primer Año"
- ✅ **Materias**:
  - "Programación I" (PROG1) - 4 créditos
  - "Matemáticas I" (MATH1) - 6 créditos
- ✅ **Estudiante Demo**: Ana Estudiante Demo (ID: EST001)
- ✅ **Profesor Demo**: Carlos Profesor Demo
- ✅ **Inscripción de ejemplo**: Ana inscrita en Programación I (estado: pendiente)

---

## 🛡️ Consideraciones de Seguridad

### Para Producción:
- ❌ **NO usar** estas credenciales en producción
- ❌ **NO exponer** el usuario demo en sistemas en vivo
- ✅ **Eliminar** el usuario demo antes de poner en producción

### Para Desarrollo:
- ✅ **Ideal para** demostraciones y pruebas
- ✅ **Útil para** testing y desarrollo
- ✅ **Perfecto para** mostrar funcionalidades

---

## 📞 Soporte

Si tienes problemas con el usuario de prueba:

1. **Verifica** que el script SQL se ejecutó correctamente
2. **Confirma** que el usuario existe en Supabase Auth
3. **Revisa** que la contraseña sea exactamente `demo123456`
4. **Comprueba** que el usuario esté asociado a una institución

---

## 🎉 ¡Disfruta Probando el Sistema!

El usuario demo te permitirá explorar todas las funcionalidades del sistema de gestión educativa sin necesidad de crear datos reales. ¡Perfecto para demostraciones y pruebas! 🚀
