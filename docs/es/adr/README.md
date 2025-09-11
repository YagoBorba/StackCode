# Registros de Decisio## Índice

Decisiones arquitectónicas actualmente documentadas:

- **[ADR-001: Estructura Monorepo](./001-monorepo-structure.md)** - Decisión de organizar el proyecto como un monorepo con npm workspaces
- **[ADR-002: TypeScript y ES Modules](./002-typescript-esm.md)** - Elección de TypeScript con ESM como stack de desarrollo principal
- **[ADR-003: Diseño de Interfaz de Línea de Comandos](./003-cli-design.md)** - Selección del framework CLI y arquitectura de comandos
- **[ADR-004: Estrategia de Internacionalización](./004-i18n-strategy.md)** - Enfoque de implementación de soporte multi-idiomaitecturales (ADRs)

_Esta es una traducción del documento original en inglés. Para la versión más actualizada, consulte [docs/adr/README.md](../../adr/README.md)._

---

Esta carpeta contiene los Registros de Decisiones Arquitecturales (ADRs) que documentan las importantes decisiones arquitecturales tomadas durante el desarrollo de StackCode.

## ¿Qué es un ADR?

Un Registro de Decisión Arquitectural (ADR) es un documento que captura una decisión arquitectural importante tomada junto con su contexto y consecuencias.

## Formato

Cada ADR sigue esta estructura:

- **Título**: ¿Cuál es la decisión arquitectural?
- **Estado**: ¿Cuál es el estado? (Propuesto, Aceptado, Deprecado, Reemplazado)
- **Contexto**: ¿Cuál es el problema que estamos viendo que está motivando esta decisión o cambio?
- **Decisión**: ¿Cuál es el cambio que estamos proponiendo o hemos acordado implementar?
- **Consecuencias**: ¿Qué se vuelve más fácil o más difícil de hacer y qué riesgos introduce este cambio?

## Índice

Decisiones arquitecturales actualmente documentadas:

- **[ADR-001: Estructura Monorepo](./001-monorepo-structure.md)** _(⏳ Planeado)_ - Decisión de organizar el proyecto como un monorepo con npm workspaces
- **[ADR-002: TypeScript y ES Modules](./002-typescript-esm.md)** _(⏳ Planeado)_ - Elección de TypeScript con ESM como stack de desarrollo principal
- **[ADR-003: Diseño de Interfaz de Línea de Comandos](./003-cli-design.md)** _(⏳ Planeado)_ - Selección del framework CLI y arquitectura de comandos
- **[ADR-004: Estrategia de Internacionalización](./004-i18n-strategy.md)** _(⏳ Planeado)_ - Enfoque de implementación de soporte multi-idioma

### ADRs Futuros

Decisiones arquitecturales adicionales a ser documentadas:

- Arquitectura de la Extensión VS Code
- Diseño del Sistema de Plantillas
- Estrategia de Integración GitHub
- Proceso de Gestión de Releases
- Estrategia de Pruebas

## Plantilla

```markdown
# ADR-XXX: [Título]

## Estado

[Propuesto | Aceptado | Deprecado | Reemplazado]

## Contexto

[Describa el contexto y declaración del problema]

## Decisión

[Describa la respuesta a estas fuerzas]

## Consecuencias

[Describa el contexto resultante después de aplicar la decisión]
```

## 🤝 Cómo Contribuir

Para contribuir con las traducciones de los ADRs:

1. **Elija un ADR** de la lista anterior
2. **Traduzca** manteniendo la estructura y formato
3. **Mantenga** los enlaces técnicos y referencias
4. **Abra un Pull Request** con la traducción

Vea la [guía de contribución](../../CONTRIBUTING.md#internationalization) para más detalles.

---

_Para la documentación en inglés, visite [docs/adr/](../../adr/)_
