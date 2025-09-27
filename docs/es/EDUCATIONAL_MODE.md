# 🎓 Guía del Modo Educativo

El Modo Educativo de StackCode transforma el kit de herramientas en una plataforma de aprendizaje interactiva que enseña mejores prácticas de DevOps mientras trabajas. Esta guía cubre todo lo que necesitas saber sobre usar y configurar las características educativas.

## 🌟 Resumen General

El Modo Educativo proporciona explicaciones contextuales y orientación sobre mejores prácticas para cada acción de StackCode. Fue diseñado para ayudar a los desarrolladores a aprender el "por qué" detrás de las prácticas de DevOps, no solo el "cómo".

### Principales Beneficios

- **Aprende Trabajando**: Obtén explicaciones en tiempo real para cada acción
- **Mejores Prácticas**: Entiende el razonamiento detrás de cada recomendación
- **Incorporación de Equipos**: Perfecto para ayudar a nuevos miembros a aprender patrones
- **Configurable**: Úsalo globalmente o bajo demanda basado en tus necesidades
- **Multiidioma**: Disponible en español, português e inglés

## 🚀 Primeros Pasos

### Configuración Rápida

```bash
# Habilitar modo educativo globalmente
stackcode config set educate true

# Ahora todos los comandos mostrarán explicaciones automáticamente
stackcode validate "feat: nueva funcionalidad"
# ✔ Válido: Este es un mensaje de commit convencional válido.
# 📚 Los commits convencionales ayudan a mantener un historial limpio y permiten automatización de releases.
```

### Uso Por Comando

```bash
# Usar modo educativo para un solo comando
stackcode validate "feat: nueva funcionalidad" --educate
stackcode commit --educate
stackcode init --educate
```

### Configuración Interactiva

```bash
# Acceder al menú de configuración
stackcode config
# Selecciona "Configurar modo educativo (global)"
```

## ⚙️ Opciones de Configuración

### Configuración Global

El modo educativo puede ser habilitado globalmente para todos los comandos:

```bash
# Habilitar para todos los comandos
stackcode config set educate true

# Deshabilitar globalmente
stackcode config set educate false

# Verificar estado actual
stackcode config get educate
```

### Comportamiento Inteligente

| Estado Global    | Flag `--educate` | Resultado                                         |
| ---------------- | ---------------- | ------------------------------------------------- |
| ✅ Habilitado    | ➖ No usado      | 📚 **Siempre muestra explicaciones**              |
| ✅ Habilitado    | ✅ Usado         | 📚 **Siempre muestra explicaciones**              |
| ❌ Deshabilitado | ➖ No usado      | ➖ **Modo normal (sin explicaciones)**            |
| ❌ Deshabilitado | ✅ Usado         | 📚 **Muestra explicaciones solo en este comando** |

## 📚 Contenido Educativo

### Comandos Soportados

#### `stackcode init --educate`

- **Scaffolding**: Por qué usar plantillas preconfiguradas
- **Dependencias**: Importancia de la validación de herramientas
- **.gitignore**: Prevención de filtraciones de seguridad
- **README.md**: Documentación como código
- **Husky**: Automatización de calidad de código
- **Git Init**: Beneficios del control de versiones

#### `stackcode commit --educate`

- **Commits Convencionales**: Estandarización y automatización
- **Historial Limpio**: Facilita reviews y debugging
- **Versionado Semántico**: Cómo los commits impactan versiones

#### `stackcode validate --educate`

- **Validación Preventiva**: Evitar commits problemáticos
- **Integración CI/CD**: Cómo la validación mejora pipelines
- **Estandarización de Equipo**: Consistencia entre desarrolladores

### Ejemplos de Mensajes

```bash
# Ejemplo: Validación de commit válido
$ stackcode validate "feat: añadir modo educativo" --educate
✔ ✔ Válido: Este es un mensaje de commit convencional válido.
📚 Los commits convencionales ayudan a mantener un historial limpio y permiten automatización de releases.

# Ejemplo: Validación de commit inválido
$ stackcode validate "commit sin patrón" --educate
✖ ✖ Inválido: Este no es un mensaje de commit convencional válido.
📚 Los commits convencionales siguen un patrón que facilita automatización. Formato: tipo(ámbito): descripción
```

## 🌐 Internacionalización

El modo educativo está completamente localizado:

- **🇪🇸 Español**: Explicaciones en español
- **🇧🇷 Português**: Explicações em português brasileiro
- **🇺🇸 English**: English explanations

El idioma de las explicaciones sigue la configuración de idioma de StackCode:

```bash
# Definir idioma
stackcode config set lang es
stackcode config set lang pt
stackcode config set lang en
```

## 🎯 Casos de Uso

### Para Desarrolladores Principiantes

```bash
# Habilitar modo educativo globalmente
stackcode config set educate true

# Ahora todos los comandos explicarán lo que hacen
stackcode init  # Explica cada archivo creado
stackcode commit  # Explica commits convencionales
```

### Para Líderes Técnicos

```bash
# Usar ocasionalmente para revisar prácticas
stackcode validate "fix: corregir bug crítico" --educate

# Demostrar al equipo durante code reviews
stackcode commit --educate
```

### Para Incorporación de Equipos

```bash
# Durante configuración inicial del desarrollador
stackcode config set educate true
stackcode init  # Enseña sobre estructura de proyectos

# Después de algunas semanas, deshabilitar si se desea
stackcode config set educate false
```

## 🔧 Configuraciones Avanzadas

### Verificar Estado Actual

```bash
# Ver todas las configuraciones
stackcode config list

# Ver solo configuración educativa
stackcode config get educate
```

### Reset de Configuración

```bash
# Resetear a valor por defecto (deshabilitado)
stackcode config unset educate
```

## ⚙️ Implementación Técnica

### Arquitectura

```typescript
// Flujo básico del modo educativo
initEducationalMode(commandFlag: boolean) →
  checkGlobalConfig() →
    determineIfEnabled() →
      showContextualMessages()
```

### Funciones Principales

- **`initEducationalMode()`**: Inicializa el modo basado en configuración + flag
- **`showEducationalMessage()`**: Muestra mensajes informativos (💡)
- **`showBestPractice()`**: Muestra mejores prácticas (📚)
- **`showSecurityTip()`**: Muestra consejos de seguridad (🔒)

### Sistema de Respaldo

El sistema posee mensajes de respaldo en caso de que las traducciones no estén disponibles:

```typescript
if (message === messageKey) {
  // Usar mensaje hardcodeado como respaldo
  const fallbackMessage = fallbackMessages[messageKey];
  // ...
}
```

## 🤝 Contribuyendo

El contenido educativo puede ser expandido:

1. **Añadir nuevos mensajes** en `packages/i18n/src/locales/`
2. **Implementar en nuevos comandos** usando `showEducationalMessage()`
3. **Traducir contenido** a nuevos idiomas
4. **Mejorar explicaciones** existentes

### Ejemplo: Añadir Nuevo Mensaje

```typescript
// 1. Añadir traducción
// packages/i18n/src/locales/es.json
"educational": {
  "nuevo_mensaje": "Explicación de la nueva funcionalidad..."
}

// 2. Usar en el comando
showEducationalMessage("educational.nuevo_mensaje");
```

## 📞 Soporte

Si encuentras problemas con el modo educativo:

- **Issues**: [GitHub Issues](https://github.com/YagoBorba/StackCode/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)
- **Documentación**: Consulta esta guía o la [documentación principal](README.md)

---

_El Modo Educativo transforma StackCode de una herramienta de automatización en un mentor de DevOps._
