# 🎓 Sistema de Gestión Educativa

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

Una plataforma moderna y escalable para la gestión educativa multi-tenant, diseñada para instituciones que necesitan administrar eficientemente sus procesos académicos.

## ✨ Características Principales

### 🏢 **Multi-tenant**
Cada institución educativa tiene sus datos completamente aislados y seguros, permitiendo que múltiples organizaciones usen la misma plataforma sin interferencias.

### 👥 **Sistema de Roles Inteligente**
- **Administrador Institucional**: Control total de la institución
- **Profesor**: Gestión de materias y calificaciones asignadas  
- **Estudiante**: Acceso a calificaciones y recursos académicos

### 📚 **Gestión Académica Completa**
- Carreras y ciclos académicos
- Materias con sistema de correlatividades
- Inscripciones y seguimiento de estudiantes
- Sistema de calificaciones flexible
- Asignación de profesores a materias

### 🔌 **Arquitectura Modular**
Sistema de plugins que permite extender funcionalidades:
- 📅 Gestión de Asistencias
- 📄 Generación de Certificados PDF
- 💬 Comunicación Interna
- Y más...

### 🎨 **Interfaz Moderna**
- Diseño responsive para todos los dispositivos
- Componentes UI reutilizables
- Dashboard intuitivo con estadísticas
- Experiencia de usuario optimizada

## 🚀 Demo en Vivo

[Ver Demo](https://demo-sistema-educativo.vercel.app) | [Documentación Completa](./DOCUMENTACION.md)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Estilos**: TailwindCSS
- **UI**: Componentes personalizados con Lucide Icons
- **Estado**: React Hooks + Supabase Realtime

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta en Supabase
- Git

## ⚡ Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-gestion-educativa.git
cd sistema-gestion-educativa

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Configurar base de datos
# Ejecutar en Supabase SQL Editor:
# 1. database/schema.sql
# 2. database/rls-policies.sql
# 3. database/sample-data.sql (opcional)

# Ejecutar en desarrollo
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📖 Documentación Completa

Para una guía detallada de instalación, configuración y uso, consulta la [Documentación Completa](./DOCUMENTACION.md) que incluye:

- 🔧 Instalación paso a paso en producción
- ⚙️ Configuración detallada de Supabase
- 👤 Guía completa de usuario por roles
- 🛠️ Desarrollo y personalización
- 🔍 Solución de problemas
- ❓ FAQ detallado

## 🎯 Casos de Uso

### Para Instituciones Educativas
- **Universidades**: Gestión completa de carreras y estudiantes
- **Institutos**: Administración de programas técnicos
- **Colegios**: Control académico y seguimiento de alumnos
- **Centros de Capacitación**: Gestión de cursos y certificaciones

### Para Administradores
- Dashboard con estadísticas en tiempo real
- Gestión completa de usuarios y roles
- Configuración de carreras y materias
- Reportes y análisis académicos

### Para Profesores
- Portal dedicado con materias asignadas
- Sistema de calificaciones intuitivo
- Gestión de estudiantes por materia
- Acceso a recursos educativos

### Para Estudiantes
- Consulta de calificaciones en tiempo real
- Estado académico detallado
- Acceso a materiales de estudio
- Portal de solicitudes y comunicaciones

## 🔐 Seguridad

- **Autenticación robusta** con Supabase Auth
- **Row Level Security (RLS)** para aislamiento de datos
- **Políticas de acceso** específicas por rol
- **HTTPS obligatorio** en producción
- **Validación de datos** en frontend y backend

## 🌟 Características Destacadas

### 📊 Dashboard Inteligente
- Estadísticas en tiempo real
- Gráficos de rendimiento académico
- Alertas y notificaciones
- Acceso rápido a funciones principales

### 🎓 Gestión Académica Avanzada
- Sistema de correlatividades automático
- Cálculo de promedios inteligente
- Seguimiento de progreso académico
- Generación de reportes personalizados

### 📱 Experiencia Móvil
- Diseño completamente responsive
- Optimizado para tablets y smartphones
- Interfaz táctil intuitiva
- Funcionalidad completa en móviles

### 🔌 Extensibilidad
- Sistema de plugins modular
- APIs para integraciones externas
- Personalización completa de la interfaz
- Fácil agregado de nuevas funcionalidades

## 🤝 Contribución

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- 📚 [Documentación Completa](./DOCUMENTACION.md)
- 🐛 [Reportar Bugs](https://github.com/tu-usuario/sistema-gestion-educativa/issues)
- 💬 [Discord Community](https://discord.gg/sistema-educativo)
- 📧 Email: soporte@sistema-educativo.com

## 🗺️ Roadmap

- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con pasarelas de pago
- [ ] Módulo de horarios y calendario académico
- [ ] Sistema de evaluaciones online
- [ ] Reporting avanzado con gráficos interactivos
- [ ] API pública para integraciones
- [ ] Soporte multi-idioma
- [ ] App móvil nativa

## 🙏 Agradecimientos

- [Supabase](https://supabase.com/) por el excelente backend
- [Next.js](https://nextjs.org/) por el framework de React
- [TailwindCSS](https://tailwindcss.com/) por el sistema de estilos
- [Lucide](https://lucide.dev/) por los iconos

---

**Desarrollado con ❤️ para la educación**

*¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!*