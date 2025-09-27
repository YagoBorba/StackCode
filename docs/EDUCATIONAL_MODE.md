# 🎓 Educational Mode Guide

StackCode's Educational Mode transforms the toolkit into an interactive learning platform that teaches DevOps best practices while you work. This guide covers everything you need to know about using and configuring the educational features.

## 🌟 Overview

Educational Mode provides contextual explanations and best practice guidance for every StackCode action. It's designed to help developers learn the "why" behind DevOps practices, not just the "how."

### Key Benefits

- **Learn While Working**: Get real-time explanations for every action
- **Best Practices**: Understand the reasoning behind each recommendation
- **Team Onboarding**: Perfect for helping new team members learn standards
- **Configurable**: Use globally or on-demand based on your needs
- **Multilingual**: Available in Portuguese and English

## 🚀 Getting Started

### Quick Setup

```bash
# Enable educational mode globally
stackcode config set educate true

# Now all commands will show explanations automatically
stackcode validate "feat: new feature"
# ✔ Valid: This is a valid conventional commit message.
# 📚 Conventional commits help maintain a clean history and enable release automation.
```

### Per-Command Usage

```bash
# Use educational mode for a single command
stackcode validate "feat: new feature" --educate
stackcode commit --educate
stackcode init --educate
```

### Interactive Configuration

```bash
# Access the configuration menu
stackcode config
# Select "Configure educational mode (global)"
```

## ⚙️ Configuration Options

### Global Configuration

Educational mode can be enabled globally so all commands show explanations automatically:

```bash
# Enable globally
stackcode config set educate true

# Disable globally
stackcode config set educate false

# Check current setting
stackcode config get educate
```

### Command Flag Override

Even with global settings, you can override behavior per command:

```bash
# Force educational mode (even if disabled globally)
stackcode validate "fix: bug" --educate

# The --educate flag works on all commands
stackcode init --educate
stackcode commit --educate
stackcode generate --educate
```

### Smart Behavior

The system intelligently combines global settings with command flags:

| Global Setting | Command Flag | Result |
|---------------|--------------|---------|
| `true` | Not used | Shows explanations |
| `true` | `--educate` | Shows explanations |
| `false` | Not used | No explanations |
| `false` | `--educate` | Shows explanations |

## 📚 Educational Content

### What Gets Explained

Educational mode provides context for all major StackCode operations:

#### Project Initialization (`init`)
- **Scaffolding Decisions**: Why specific file structures are recommended
- **Dependency Validation**: Importance of having correct tools installed
- **Configuration Files**: Purpose of each generated file

#### File Generation (`generate`)
- **`.gitignore`**: Security benefits and best practices
- **`README.md`**: Documentation importance for project success
- **Template Choices**: Why specific templates fit certain use cases

#### Git Workflow (`git`, `commit`)
- **Conventional Commits**: Benefits for automation and collaboration
- **Branch Management**: GitFlow principles and team coordination
- **Version Control**: Best practices for commit history

#### Release Management (`release`)
- **Semantic Versioning**: How and why versions are calculated
- **Automation Benefits**: Reducing manual release overhead
- **Changelog Generation**: Keeping stakeholders informed

#### Validation (`validate`)
- **Quality Gates**: Importance of automated validation
- **Commit Standards**: How consistency improves team productivity
- **Integration Benefits**: CI/CD pipeline optimization

### Example Educational Messages

```bash
# .gitignore creation
💡 A .gitignore file is being created to prevent secrets and unnecessary 
   files (like node_modules) from being saved in the repository. This 
   keeps your repository clean and secure.

# Conventional commit validation
📚 Conventional commits follow a standard that enables automation and 
   understanding. Format: type(scope): description

# Husky setup
💡 Husky is being configured to automate checks before commits. This 
   ensures that problematic code doesn't get pushed to the repository, 
   maintaining code quality.
```

## 🛠️ Advanced Usage

### For Team Leaders

Educational mode is excellent for onboarding and maintaining standards:

```bash
# Set up educational mode for the entire team
echo "educate=true" >> .stackcoderc
# Now everyone gets explanations by default

# Create team guidelines
stackcode init --educate > team-setup-guide.txt
```

### For Learning Environments

Perfect for training sessions and workshops:

```bash
# Enable for comprehensive learning
stackcode config set educate true

# Walk through a complete project setup with explanations
stackcode init
stackcode generate readme
stackcode commit --dry-run
```

### Integration with CI/CD

Educational mode can be disabled in automated environments:

```bash
# In CI/CD scripts, explicitly disable to reduce noise
stackcode validate "$COMMIT_MESSAGE" --no-educate
```

## 🔧 Technical Implementation

### Architecture

Educational mode is implemented as a cross-cutting concern that integrates with all command handlers:

```typescript
// Each command initializes educational mode
initEducationalMode(argv.educate || false);

// Then shows contextual messages
showEducationalMessage("educational.gitignore_explanation");
showBestPractice("educational.conventional_commits");
showSecurityTip("educational.secrets_warning");
```

### Message System

- **Internationalized**: Full support for multiple languages
- **Fallback System**: Hardcoded messages if translations fail
- **Context-Aware**: Different messages based on command and context
- **Configurable Icons**: 💡 for tips, 📚 for practices, 🔒 for security

### Performance

Educational mode adds minimal overhead:
- Message lookup: ~1ms per message
- Translation processing: Cached after first load
- No network requests or external dependencies

## 🌍 Internationalization

Educational mode is fully internationalized:

### Supported Languages

- **English** (`en`): Default language
- **Portuguese** (`pt`): Complete translation available

### Adding New Languages

To add support for additional languages:

1. Create new locale file in `packages/i18n/src/locales/`
2. Translate all `educational.*` keys
3. Test with `stackcode config set lang <code>`

### Language Detection

The system automatically uses the configured StackCode language:

```bash
# Set Portuguese
stackcode config set lang pt

# Educational messages will now appear in Portuguese
stackcode validate "feat: nova funcionalidade" --educate
# ✔ Válido: Esta é uma mensagem de commit convencional válida.
# 📚 Commits convencionais ajudam a manter um histórico limpo...
```

## 🎯 Best Practices

### When to Enable Globally

✅ **Good for:**
- Learning environments and training
- New team members getting familiar with practices
- Teams establishing new standards
- Personal projects where you want to learn

❌ **Consider disabling for:**
- Experienced teams with established workflows
- Automated scripts and CI/CD pipelines
- High-frequency operations where output noise matters

### Effective Learning Strategies

1. **Start with Global Mode**: Enable globally when first learning
2. **Gradual Transition**: Switch to per-command usage as you become familiar
3. **Team Standards**: Use for onboarding, then let individuals choose
4. **Documentation**: Capture educational insights for team documentation

### Troubleshooting

#### Educational Messages Not Appearing

1. Check global configuration: `stackcode config get educate`
2. Verify command supports educational mode
3. Check language settings: `stackcode config get lang`
4. Try explicit flag: `--educate`

#### Wrong Language

```bash
# Check current language
stackcode config get lang

# Set correct language
stackcode config set lang pt  # or 'en'
```

#### Performance Concerns

Educational mode is designed to be lightweight, but if needed:

```bash
# Disable globally
stackcode config set educate false

# Use selectively
stackcode command --educate  # only when needed
```

## 📖 Examples and Use Cases

### New Developer Onboarding

```bash
# Day 1: Enable educational mode
stackcode config set educate true

# Follow a complete project setup with explanations
stackcode init
# Learn about project structure, dependencies, and best practices

stackcode commit
# Learn about conventional commits and team standards

stackcode release
# Understand versioning and release automation
```

### Team Standardization

```bash
# Team lead enables for everyone
echo "educate=true" >> .stackcoderc.json

# Team members automatically get explanations
# No need to remember special flags

# Gradually transition to per-command usage
# As team becomes more experienced
```

### Training and Workshops

```bash
# Instructor setup for hands-on learning
stackcode config set educate true
stackcode config set lang pt  # if Portuguese audience

# Students get explanations for everything
# Perfect for learning DevOps concepts
```

## 🔗 Related Documentation

- **[Configuration Guide](../CONTRIBUTING.md#configuration)**: Complete configuration options
- **[Command Reference](../README.md#commands)**: All available commands
- **[Internationalization](../docs/CONTRIBUTING.md#internationalization)**: Adding new languages
- **[Architecture](ARCHITECTURE.md#educational-mode)**: Technical implementation details

---

*Educational Mode makes StackCode more than just a tool—it becomes your DevOps mentor, teaching best practices as you build amazing software.*
