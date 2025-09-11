# ADR-004: Internationalization Strategy

## Status

Accepted

## Context

StackCode is designed to be used by developers worldwide and needs to:

- Support multiple languages for all user-facing text
- Provide localized error messages and prompts
- Support both CLI and VS Code extension interfaces
- Be extensible for additional languages
- Maintain performance with locale loading
- Support dynamic language switching

We needed to decide:

- i18n library and approach
- Locale file organization
- Language detection strategy
- Fallback mechanisms
- Integration across packages

## Decision

We will implement a custom i18n system with a dedicated package:

### @stackcode/i18n Package

- Centralized internationalization logic
- JSON-based locale files
- Runtime locale switching
- Automatic fallback to English
- Shared across all packages

### Locale Management

- JSON files for each supported language in `locales/` directory
- Hierarchical key structure for organization
- Support for interpolation and pluralization
- Template literal style for better developer experience

### Language Detection

- Environment variable (`STACKCODE_LANG`)
- System locale detection as fallback
- User configuration override
- VS Code extension uses VS Code's locale

### Supported Languages (Initial)

- English (en) - Primary/fallback language
- Portuguese (pt) - Secondary language

## Consequences

### Positive

- **Global Accessibility**: Supports international developer community
- **Consistent Localization**: Same i18n system across CLI and VS Code extension
- **Extensible**: Easy to add new languages by adding JSON files
- **Performance**: Lazy loading of locale files
- **Type Safety**: TypeScript interfaces for locale keys
- **Developer Experience**: Simple API for developers

### Negative

- **Maintenance Overhead**: All user-facing strings need translation
- **Coordination**: Changes require updates to all locale files
- **Testing Complexity**: Need to test multiple language scenarios

### Technical Implementation

#### Locale File Structure

```json
{
  "commands": {
    "init": {
      "description": "Initialize a new project",
      "prompts": {
        "projectName": "What is your project name?",
        "techStack": "Select a technology stack:"
      }
    },
    "commit": {
      "description": "Create a conventional commit",
      "validation": {
        "invalidType": "Invalid commit type: {type}"
      }
    }
  },
  "errors": {
    "fileNotFound": "File not found: {filename}",
    "networkError": "Network error occurred"
  }
}
```

#### API Design

```typescript
// Basic translation
t("commands.init.description");

// With interpolation
t("errors.fileNotFound", { filename: "package.json" });

// Pluralization
t("files.count", { count: 5 });
```

### Language Detection Priority

1. `STACKCODE_LANG` environment variable
2. User configuration file
3. System locale (`process.env.LANG`)
4. Fallback to English

### Package Integration

#### CLI Package

- Initialize i18n before command parsing
- Use locale for help text and prompts
- Support `--lang` flag for temporary override

#### VS Code Extension

- Use VS Code's built-in locale detection
- Respect VS Code's language settings
- Provide language switching in extension settings

#### Core Package

- All user-facing error messages support i18n
- Template descriptions and comments localized
- GitHub integration messages localized

### File Organization

```
packages/i18n/
├── src/
│   ├── index.ts           # Main i18n API
│   └── locales/
│       ├── en.json        # English (primary)
│       └── pt.json        # Portuguese
```

### Future Expansion Strategy

- Additional languages in `locales/` directory
- Community contributions for translations
- Possible locale validation tools
- Right-to-left (RTL) language support consideration

## Alternatives Considered

### i18next

- **Pros**: Mature, feature-rich, ecosystem support
- **Cons**: Heavy dependency, over-engineered for our needs

### React i18n (for VS Code extension only)

- **Pros**: React ecosystem integration
- **Cons**: Doesn't solve CLI internationalization

### No internationalization

- **Pros**: Simpler development and maintenance
- **Cons**: Limits global adoption and accessibility

## Implementation Guidelines

### Translation Keys

- Use hierarchical dot notation for organization
- Descriptive key names that indicate context
- Consistent naming patterns across components
- Avoid deeply nested structures

### String Management

- All user-facing strings must use i18n system
- No hardcoded English strings in code
- Include context comments for translators
- Use interpolation for dynamic content

### Testing Strategy

- Test default (English) locale thoroughly
- Spot check key translations
- Test locale switching functionality
- Ensure fallbacks work correctly

### Contribution Guidelines

- Native speakers preferred for translations
- Translation reviews by multiple contributors
- Consistent terminology across all strings
- Regular updates when English text changes
