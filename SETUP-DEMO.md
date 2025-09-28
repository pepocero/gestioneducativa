# 🚀 Setup Rápido - Usuario Demo

## ⚡ Configuración en 5 Minutos

### 1. Ejecutar Scripts en Supabase
```sql
-- Ejecuta este script primero (configuración completa automática)
-- database/complete-demo-setup.sql
```

```sql
-- Ejecuta este script segundo
-- database/create-sample-data.sql
```

**⚠️ IMPORTANTE:** El script `complete-demo-setup.sql` maneja automáticamente la sincronización del `auth_user_id`. Si encuentras errores, también puedes usar:
```sql
-- Alternativa manual si el automático falla
-- database/get-and-fix-demo-user.sql
```

### 2. Crear Usuario en Supabase Auth
1. Ve a **Authentication** → **Users** → **Add User**
2. **Email:** `demo@educacion.com`
3. **Password:** `demo123456`
4. **Confirm email:** ✅ (marcado)

### 3. Acceder al Sistema
- **URL:** `http://localhost:3000`
- **Email:** `demo@educacion.com`
- **Contraseña:** `demo123456`

---

## 🎯 Datos Listos para Probar

Una vez configurado, tendrás:

### 📊 Estadísticas Iniciales
- ✅ 1 Institución
- ✅ 1 Carrera
- ✅ 2 Materias
- ✅ 1 Estudiante
- ✅ 1 Profesor
- ✅ 1 Inscripción pendiente

### 🧪 Casos de Prueba Inmediatos
1. **Ver inscripción pendiente** → Aprobar/Rechazar
2. **Crear nuevo estudiante** → Ver en la lista
3. **Crear nueva materia** → Asignar a carrera
4. **Administrar institución** → Navegar por todas las pestañas

---

## 🔧 Troubleshooting

### ❌ "Error PGRST116 - Cannot coerce the result to a single JSON object"
**Problema:** El `auth_user_id` no coincide entre la tabla `users` y Supabase Auth.

**Solución:**
1. Ejecuta el script `database/complete-demo-setup.sql` (maneja esto automáticamente)
2. O usa `database/get-and-fix-demo-user.sql` para hacerlo manualmente

### ❌ "Usuario no encontrado"
- Verifica que el script `complete-demo-setup.sql` se ejecutó
- Confirma que existe en la tabla `users`

### ❌ "Credenciales incorrectas"
- Verifica que el usuario existe en **Authentication** → **Users**
- Confirma que la contraseña es exactamente `demo123456`

### ❌ "Sin datos para mostrar"
- Ejecuta el script `create-sample-data.sql`
- Verifica que se crearon los datos de ejemplo

---

## 🎉 ¡Listo para Demostrar!

Con esta configuración, cualquier persona puede:
- ✅ Acceder inmediatamente al sistema
- ✅ Ver datos reales y funcionales
- ✅ Probar todas las funcionalidades
- ✅ Crear nuevos datos de prueba

**Perfecto para:** Demostraciones, pruebas, presentaciones y evaluaciones del sistema.
