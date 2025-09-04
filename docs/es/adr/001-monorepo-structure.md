# ADR-001: Estructura Monorepo

## Estado
Aceptado

## Contexto
StackCode consiste en múltiples paquetes relacionados que comparten funcionalidad común:
- Una herramienta CLI para uso en línea de comandos
- Una extensión VS Code para integración con IDE
- Lógica de negocio principal que ambas interfaces usan
- Soporte de internacionalización en todos los componentes

Necesitábamos decidir cómo organizar estos paquetes relacionados pero distintos de una manera que:
- Permita compartir código entre paquetes
- Mantenga límites claros entre componentes
- Simplifique la gestión de dependencias
- Facilite releases coordinados
- Reduzca la complejidad de desarrollo

## Decisión
Usaremos una estructura monorepo con los siguientes paquetes:
- `@stackcode/cli` - Interfaz de línea de comandos
- `@stackcode/core` - Lógica de negocio compartida y utilidades
- `@stackcode/i18n` - Soporte de internacionalización
- `stackcode-vscode` - Extensión VS Code

El monorepo será gestionado usando npm workspaces, proporcionando:
- Gestión compartida de dependencias
- Linking entre paquetes
- Procesos de build coordinados
- Estrategia de versionado unificada

## Consecuencias

### Positivas
- **Reutilización de Código**: La lógica de negocio principal puede ser compartida entre CLI y extensión VS Code
- **APIs Consistentes**: Todos los paquetes usan las mismas interfaces y tipos subyacentes
- **Desarrollo Simplificado**: Checkout de repositorio único proporciona acceso a todos los componentes
- **Releases Coordinados**: Todos los paquetes pueden ser versionados y lanzados juntos
- **Reducción de Duplicación**: Utilidades comunes y tipos están centralizados
- **Pruebas Más Fáciles**: Las pruebas de integración pueden abarcar múltiples paquetes

### Negativas
- **Complejidad de Build**: El sistema de build debe manejar múltiples paquetes y sus dependencias
- **Tamaño del Repositorio**: Repositorio único contiene todos los componentes, potencialmente aumentando el tamaño
- **Limitaciones de Herramientas**: Algunas herramientas pueden no manejar monorepos de forma óptima
- **Gestión de Dependencias**: Cambios en paquetes principales afectan todos los dependientes

### Riesgos
- **Dependencias Circulares**: Se debe tener cuidado para evitar referencias circulares entre paquetes
- **Orden de Build**: El orden de build de los paquetes se vuelve importante
- **Coordinación de Versión**: Todos los paquetes típicamente necesitan ser versionados juntos

### Estrategias de Mitigación
- Usar referencias de proyecto TypeScript para manejar dependencias de build
- Implementar límites e interfaces claros entre paquetes
- Usar npm workspaces para gestión de dependencias
- Establecer directrices claras para dependencias entre paquetes
