# Contributing to Sistema de Gestión Educativa

¡Gracias por tu interés en contribuir! Este documento te guiará a través del proceso de contribución.

## 🚀 Cómo Contribuir

### 1. Fork y Clone
```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/tu-usuario/sistema-gestion-educativa.git
cd sistema-gestion-educativa
```

### 2. Configurar Entorno de Desarrollo
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Configurar base de datos (ver DOCUMENTACION.md)
```

### 3. Crear una Rama
```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/corregir-bug
```

### 4. Hacer Cambios
- Sigue las convenciones de código existentes
- Agrega tests si es necesario
- Actualiza documentación si corresponde

### 5. Commit y Push
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 6. Crear Pull Request
- Ve a GitHub y crea un Pull Request
- Describe claramente los cambios
- Menciona cualquier issue relacionado

## 📋 Convenciones

### Commits
Usa [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` cambios de formato
- `refactor:` refactorización de código
- `test:` agregar o corregir tests

### Código
- Usa TypeScript
- Sigue las reglas de ESLint
- Usa Prettier para formato
- Documenta funciones complejas

### Componentes
- Usa componentes funcionales con hooks
- Props tipadas con TypeScript
- Nombres descriptivos y claros

## 🐛 Reportar Bugs

### Antes de Reportar
1. Verifica que no sea un problema conocido
2. Revisa la documentación
3. Prueba en la última versión

### Información Necesaria
- Descripción detallada del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del entorno (OS, navegador, etc.)

## ✨ Solicitar Funcionalidades

### Antes de Solicitar
1. Verifica que no esté en el roadmap
2. Considera si es realmente necesario
3. Piensa en casos de uso específicos

### Información Necesaria
- Descripción clara de la funcionalidad
- Casos de uso específicos
- Beneficios para los usuarios
- Consideraciones técnicas

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

### Escribir Tests
- Tests para nuevas funcionalidades
- Tests para correcciones de bugs
- Tests de componentes críticos

## 📚 Documentación

### Actualizar Documentación
- README.md para cambios importantes
- DOCUMENTACION.md para guías detalladas
- Comentarios en código complejo
- JSDoc para funciones públicas

## 🔒 Seguridad

### Reportar Vulnerabilidades
- NO crear issues públicos para vulnerabilidades
- Enviar email a: seguridad@sistema-educativo.com
- Incluir detalles técnicos
- Esperar confirmación antes de divulgar

## 🏷️ Releases

### Proceso de Release
1. Actualizar versiones en package.json
2. Actualizar CHANGELOG.md
3. Crear tag de versión
4. Generar release notes

### Versionado
Seguimos [Semantic Versioning](https://semver.org/):
- `MAJOR`: cambios incompatibles
- `MINOR`: nueva funcionalidad compatible
- `PATCH`: correcciones compatibles

## 🤝 Código de Conducta

### Nuestros Compromisos
- Ambiente inclusivo y acogedor
- Respeto por todas las personas
- Colaboración constructiva
- Aceptación de críticas constructivas

### Comportamiento Inaceptable
- Lenguaje o imágenes ofensivas
- Comentarios despectivos o discriminatorios
- Acoso público o privado
- Cualquier comportamiento inapropiado

## 📞 Contacto

- 📧 Email: contribuciones@sistema-educativo.com
- 💬 Discord: [Servidor de la Comunidad](https://discord.gg/sistema-educativo)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/sistema-gestion-educativa/issues)

## 🙏 Reconocimientos

Gracias a todos los contribuidores que hacen posible este proyecto:

- [Ver lista completa de contribuidores](https://github.com/tu-usuario/sistema-gestion-educativa/graphs/contributors)

---

**¡Gracias por contribuir al futuro de la educación!** 🎓

