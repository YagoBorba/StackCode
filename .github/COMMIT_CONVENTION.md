# Conventional Commits Reference

## Format
```
<emoji> <type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Common Types with Emojis

| Emoji | Code | Type | Description |
|-------|------|------|-------------|
| ✨ | `:sparkles:` | `feat` | Introduce new features |
| 🐛 | `:bug:` | `fix` | Fix a bug |
| 📝 | `:memo:` | `docs` | Add or update documentation |
| 🎨 | `:art:` | `style` | Improve structure/format of code |
| ♻️ | `:recycle:` | `refactor` | Refactor code |
| ⚡️ | `:zap:` | `perf` | Improve performance |
| ✅ | `:white_check_mark:` | `test` | Add, update, or pass tests |
| 🔧 | `:wrench:` | `chore` | Add or update configuration files |
| 🚀 | `:rocket:` | `build` | Deploy stuff |
| 👷 | `:construction_worker:` | `ci` | Add or update CI build system |

## Examples

```bash
# Feature
git commit -m "✨ feat(auth): add JWT token validation"

# Bug fix
git commit -m "🐛 fix(api): handle null response in user service"

# Documentation
git commit -m "📝 docs: update API documentation for v2.0"

# Refactoring
git commit -m "♻️ refactor(utils): extract validation logic to separate module"

# Configuration
git commit -m "🔧 chore: update ESLint configuration for TypeScript"
```

## Breaking Changes
Add `!` after the type for breaking changes:
```bash
git commit -m "💥 feat!: remove deprecated authentication methods"
```

## Scope Guidelines
- Use lowercase
- Be specific but concise
- Examples: `auth`, `api`, `ui`, `core`, `cli`, `docs`

## Body and Footer
- Use imperative mood ("add" not "added")
- Explain the what and why, not the how
- Reference issues: `Closes #123`, `Fixes #456`
