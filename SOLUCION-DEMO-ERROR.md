# 🔧 Solución para Error del Usuario Demo

## ❌ Error Actual:
```
PGRST116 - Cannot coerce the result to a single JSON object
auth_user_id=eq.4741d4e3-e6b9-4ab1-9408-becd05e18b16
```

## 🎯 Causa del Problema:
El `auth_user_id` `4741d4e3-e6b9-4ab1-9408-becd05e18b16` no existe en la tabla `users`, aunque sí existe en Supabase Auth.

---

## 🚀 SOLUCIONES (Elige una):

### 🔹 MÉTODO 1: Diagnóstico Primero
1. Ejecuta: `database/debug-demo-user.sql`
2. Revisa los resultados para entender qué está mal
3. Luego ejecuta el método 2 o 3

### 🔹 MÉTODO 2: Corrección Manual (Recomendado)
1. Ejecuta: `database/fix-demo-user-manual.sql`
2. Este script:
   - Elimina el usuario demo existente
   - Lo recrea con el `auth_user_id` correcto
   - Verifica que todo esté bien

### 🔹 MÉTODO 3: Corrección Rápida
1. Ejecuta: `database/quick-fix-demo.sql`
2. Este script:
   - Actualiza el `auth_user_id` existente
   - O crea el usuario si no existe
   - Más directo y rápido

---

## 🧪 PASOS PARA PROBAR:

### Paso 1: Ejecutar Script de Corrección
```sql
-- Ejecuta en Supabase SQL Editor:
-- database/quick-fix-demo.sql
```

### Paso 2: Verificar Resultado
El script te mostrará:
```
✅ Resultado final:
Email: demo@educacion.com
auth_user_id: 4741d4e3-e6b9-4ab1-9408-becd05e18b16
Nombre: Usuario Demo
Rol: admin
Institución: [nombre]
```

### Paso 3: Probar Login
1. Refresca la página (`Ctrl+F5`)
2. Login con:
   - **Email:** `demo@educacion.com`
   - **Contraseña:** `demo123456`
3. ¡Debería funcionar sin errores!

---

## 🔍 Verificación Manual:

Si quieres verificar manualmente que todo esté correcto:

```sql
-- Verificar que el usuario existe y tiene el auth_user_id correcto
SELECT 
  email,
  auth_user_id,
  first_name || ' ' || last_name as nombre,
  role
FROM users 
WHERE email = 'demo@educacion.com';

-- Verificar que el auth_user_id coincide con auth.users
SELECT 
  id as auth_user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'demo@educacion.com';
```

Ambas consultas deben mostrar el mismo `auth_user_id`.

---

## 🎉 ¡Después de la Corrección!

Una vez solucionado, podrás:
- ✅ Hacer login sin errores
- ✅ Ver el dashboard correctamente
- ✅ Navegar por todas las secciones
- ✅ Usar todas las funcionalidades del sistema

---

## 🆘 Si Aún No Funciona:

1. **Verifica** que ejecutaste el script correctamente
2. **Confirma** que no hay errores en Supabase SQL Editor
3. **Revisa** que el `auth_user_id` coincide exactamente
4. **Prueba** hacer logout y login nuevamente

---

**🚀 ¡El script `quick-fix-demo.sql` debería solucionar el problema inmediatamente!**

