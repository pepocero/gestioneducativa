# Guía de Instalación Rápida

## 🚀 Para Desarrolladores

### Requisitos Mínimos
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### Instalación en 5 minutos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-gestion-educativa.git
cd sistema-gestion-educativa

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Configurar base de datos en Supabase
# Ejecutar en orden en Supabase SQL Editor:
# - database/schema.sql
# - database/rls-policies.sql
# - database/sample-data.sql (opcional)

# 5. Ejecutar en desarrollo
npm run dev
```

¡Listo! Visita [http://localhost:3000](http://localhost:3000)

## 📚 Documentación Completa

Para instalación en producción, configuración avanzada y guías detalladas:
**[Ver Documentación Completa](./DOCUMENTACION.md)**

## 🆘 ¿Necesitas Ayuda?

- 📖 [Documentación Completa](./DOCUMENTACION.md)
- 🐛 [Reportar Problemas](https://github.com/tu-usuario/sistema-gestion-educativa/issues)
- 💬 [Discord](https://discord.gg/sistema-educativo)
- 📧 soporte@sistema-educativo.com

