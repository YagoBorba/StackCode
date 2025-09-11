# 📚 Documentación de StackCode

¡Bienvenido al hub de documentación de StackCode! Este directorio contiene documentación completa para desarrolladores, contribuidores y organizaciones que usan StackCode.

## 📋 Navegación Rápida

### 🏗️ **Documentación Principal**

- **[📐 Guía de Arquitectura](ARCHITECTURE.md)** - Visión técnica completa de la estructura del monorepo, principios de diseño e interacciones entre componentes
- **[🛠️ Stacks de Tecnología](STACKS.md)** - Lista detallada de frameworks, plantillas y tipos de proyecto soportados
- **[🤝 Guía de Contribución](CONTRIBUTING.md)** - Todo lo que necesitas saber para contribuir a StackCode
- **[🚀 Guía de Auto-hospedaje](SELF_HOSTING_GUIDE.md)** - Despliega y personaliza StackCode para tu organización

### 🏛️ **Decisiones Arquitecturales**

- **[Directorio ADR](adr/)** - Registros de Decisiones Arquitecturales documentando decisiones de diseño importantes
  - [ADR-001: Estructura Monorepo](adr/001-monorepo-structure.md)
  - [ADR-002: TypeScript y ES Modules](adr/002-typescript-esm.md)
  - [ADR-003: Diseño de CLI](adr/003-cli-design.md)
  - [ADR-004: Estrategia de Internacionalización](adr/004-i18n-strategy.md)

### 🌐 **Traducciones**

- **[🇪🇸 Español](.)** - Documentación en español _(actual)_
- **[🇧🇷 Português (Brasil)](../pt-BR/)** - Documentação em português
- **[🇺🇸 English](../)** - English documentation _(original)_

## 🎯 **Documentación por Audiencia**

### 👩‍💻 **Para Desarrolladores Usando StackCode**

Comienza aquí si quieres usar StackCode en tus proyectos:

1. [README Principal](../../README.md) - Visión general del proyecto y primeros pasos
2. [Stacks de Tecnología](STACKS.md) - Ve qué tipos de proyecto son soportados
3. [Guía de Auto-hospedaje](SELF_HOSTING_GUIDE.md) - Despliega para tu organización

### 🛠️ **Para Contribuidores**

Comienza aquí si quieres contribuir a StackCode:

1. [Guía de Contribución](CONTRIBUTING.md) - Cómo contribuir efectivamente
2. [Guía de Arquitectura](ARCHITECTURE.md) - Entiende la base de código
3. [Directorio ADR](adr/) - Aprende sobre decisiones arquitecturales

### 🏢 **Para Organizaciones**

Comienza aquí si quieres desplegar StackCode internamente:

1. [Guía de Auto-hospedaje](SELF_HOSTING_GUIDE.md) - Despliegue y personalización
2. [Guía de Arquitectura](ARCHITECTURE.md) - Visión técnica general
3. [Guía de Contribución](CONTRIBUTING.md) - Cómo contribuir mejoras de vuelta

## 🔧 **Referencia Técnica**

### Estructura del Proyecto

```
docs/
├── README.md                 # Este archivo
├── ARCHITECTURE.md           # Arquitectura técnica
├── CONTRIBUTING.md           # Directrices de contribución
├── SELF_HOSTING_GUIDE.md     # Guía de despliegue
├── STACKS.md                 # Tecnologías soportadas
├── adr/                      # Registros de Decisiones Arquitecturales
│   ├── README.md
│   ├── 001-monorepo-structure.md
│   ├── 002-typescript-esm.md
│   ├── 003-cli-design.md
│   └── 004-i18n-strategy.md
├── pt-BR/                    # Traducciones en portugués
│   └── README.md
└── es/                       # Traducciones en español
    └── README.md
```

### Conceptos Clave

- **Arquitectura Monorepo**: StackCode usa un monorepo con múltiples paquetes
- **Sistema de Plantillas**: Plantillas de proyecto configurables para diferentes tecnologías
- **CLI + Extensión VS Code**: Múltiples interfaces para la misma funcionalidad principal
- **Internacionalización**: Soporte multi-idioma en todas las interfaces

## 🤝 **Contribuyendo a la Documentación**

¡Acogemos mejoras a nuestra documentación! Así es como puedes ayudar:

### Correcciones Rápidas

- Corrige errores tipográficos, enlaces rotos o explicaciones poco claras
- Añade ejemplos o mejora los existentes
- Actualiza información desactualizada

### Contribuciones Principales

- Escribe nuevas guías o tutoriales
- Crea documentación para nuevas características
- Ayuda con traducciones

### Ayuda con Traducciones

- Traduce documentación existente a tu idioma
- Revisa traducciones de otros contribuidores
- Mantén consistencia entre traducciones

Ve nuestra [Guía de Contribución](CONTRIBUTING.md) para instrucciones detalladas.

## 🔗 **Recursos Externos**

- **[Repositorio GitHub](https://github.com/YagoBorba/StackCode)** - Código fuente e issues
- **[Paquete NPM](https://www.npmjs.com/package/@stackcode/cli)** - Paquete CLI publicado
- **[Extensión VS Code](https://marketplace.visualstudio.com/items?itemName=YagoBorba.stackcode-vscode)** - VS Code Marketplace

## 📞 **Obteniendo Ayuda**

¿Necesitas ayuda con StackCode?

- **[GitHub Issues](https://github.com/YagoBorba/StackCode/issues)** - Reportes de bugs y solicitudes de características
- **[GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)** - Preguntas y soporte de la comunidad
- **[Guía de Contribución](CONTRIBUTING.md)** - Cómo involucrarse

---

_Última actualización: Septiembre 2025 | Equipo de Documentación StackCode_
