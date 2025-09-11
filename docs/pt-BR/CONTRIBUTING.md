# Guia de Contribuição

Obrigado por considerar contribuir com o StackCode! Este guia fornece todas as informações necessárias para contribuir efetivamente com o projeto.

## 📋 Navegação Rápida

- **[Visão Geral da Arquitetura](#architecture-overview)** - Entenda a estrutura do projeto
- **[Configuração de Desenvolvimento](#development-setup)** - Prepare seu ambiente
- **[Tipos de Contribuição](#how-to-contribute)** - Diferentes formas de contribuir
- **[Padrões de Código](#coding-standards)** - Siga nossas diretrizes
- **[Internacionalização](#internationalization)** - Ajude com traduções

## 🏗️ Visão Geral da Arquitetura

Antes de contribuir, familiarize-se com a arquitetura do projeto:

- **[📐 Guia de Arquitetura](ARCHITECTURE.md)** - Visão completa da estrutura do monorepo, princípios de design e interações entre componentes
- **[🏛️ ADRs](adr/)** - Registros de decisão arquitetural explicando escolhas de design importantes
- **[🛠️ Stacks de Tecnologia](STACKS.md)** - Frameworks suportados e templates de projeto

Entender a arquitetura ajudará você a:

- Escolher o pacote certo para suas mudanças
- Seguir padrões e convenções estabelecidos
- Entender dependências entre pacotes
- Escrever melhores testes e documentação

## 🚀 Configuração de Desenvolvimento

1. **Fork e Clone**

   ```bash
   git clone https://github.com/seu-usuario/StackCode.git
   cd StackCode
   ```

2. **Instalar Dependências**

   ```bash
   npm install
   ```

3. **Construir o Projeto**

   ```bash
   npm run build
   ```

4. **Testar sua Configuração**

   ```bash
   # Executar testes
   npm test

   # Testar CLI localmente
   node packages/cli/dist/index.js --help
   ```

## 🤝 Como Contribuir

### 🐛 Relatórios de Bug

- Verifique [issues existentes](https://github.com/YagoBorba/StackCode/issues) primeiro
- Forneça passos claros de reprodução
- Inclua detalhes do ambiente (OS, versão Node.js, etc.)
- Use o template de relatório de bug

### ✨ Solicitações de Recursos

- Abra uma issue para discutir o recurso primeiro
- Explique o caso de uso e benefícios
- Considere se se encaixa no escopo do projeto
- Forneça ideias de implementação se possível

### 📝 Melhorias na Documentação

- Corrija erros de digitação, melhore a clareza, adicione exemplos
- Atualize docs ao adicionar novos recursos
- Ajude com traduções (veja [Internacionalização](#internationalization))

### 🛠️ Contribuições de Código

- Escolha issues marcadas com `good-first-issue` ou `help-wanted`
- Siga o [fluxo de trabalho de desenvolvimento](#development-workflow)
- Garanta que todos os testes passem
- Adicione testes para nova funcionalidade

### 🌐 Adicionando Novos Stacks de Tecnologia

Veja o guia abrangente em [CONTRIBUTING.md principal](../../CONTRIBUTING.md#adding-new-technology-stacks).

## � Fluxo de Trabalho de Desenvolvimento

1. **Criar um Branch de Feature**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/nome-da-sua-feature
   ```

2. **Fazer suas Mudanças**
   - Siga padrões de codificação
   - Adicione testes para nova funcionalidade
   - Atualize documentação conforme necessário

3. **Testar Completamente**

   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit suas Mudanças**

   ```bash
   # Use commits convencionais com emojis
   git commit -m "feat(cli): ✨ adicionar novo template de projeto"
   ```

5. **Push e Criar PR**
   ```bash
   git push origin feat/nome-da-sua-feature
   # Abra PR contra o branch develop
   ```

## 🎨 Padrões de Codificação

### Princípios Gerais

- **Código Limpo**: Escreva código legível e manutenível
- **Princípios SOLID**: Siga princípios de design SOLID
- **Responsabilidade Única**: Cada função/classe deve ter um propósito
- **Documentação**: Use comentários TSDoc para APIs públicas

### Diretrizes TypeScript

- Use configuração TypeScript estrita
- Prefira tipos explícitos sobre `any`
- Use interfaces para formas de objeto
- Siga regras ESLint

### Requisitos de Teste

- Adicione testes unitários para nova funcionalidade
- Mantenha ou melhore cobertura de testes
- Teste tanto cenários de sucesso quanto de erro
- Use nomes descritivos de teste

## 🌐 Internacionalização

Acolhemos contribuições para suportar mais idiomas:

### Estrutura Atual

```
packages/i18n/src/locales/
├── en.json          # Inglês (primário)
└── pt.json          # Português
```

### Adicionando Novos Idiomas

1. **Criar Arquivo de Locale**

   ```bash
   # Exemplo para espanhol
   cp packages/i18n/src/locales/en.json packages/i18n/src/locales/es.json
   ```

2. **Traduzir Strings**

   ```json
   {
     "commands": {
       "init": {
         "description": "Inicializar un nuevo proyecto"
       }
     }
   }
   ```

3. **Testar a Tradução**
   ```bash
   STACKCODE_LANG=es node packages/cli/dist/index.js --help
   ```

### Estrutura Futura (Planejada)

```
docs/
├── pt-BR/           # Português (Brasil)
├── es/              # Espanhol
├── fr/              # Francês
└── de/              # Alemão
```

## 📏 Processo de Revisão de Código

### Para Contribuidores

- Mantenha PRs focados e pequenos
- Escreva descrições claras de PR
- Responda ao feedback prontamente
- Atualize documentação conforme necessário

### Critérios de Revisão

- Qualidade e manutenibilidade do código
- Cobertura e qualidade de testes
- Completude da documentação
- Aderência aos padrões do projeto
- Considerações de mudanças quebradas

## 🏷️ Labels de Issues

- `good-first-issue` - Perfeito para novatos
- `help-wanted` - Ajuda da comunidade necessária
- `bug` - Algo não está funcionando
- `enhancement` - Novo recurso ou melhoria
- `documentation` - Relacionado à documentação
- `question` - Mais informações necessárias

## 📋 Checklist de Contribuição

Antes de submeter seu PR, garanta que:

- [ ] Código segue padrões do projeto
- [ ] Testes são adicionados e passando
- [ ] Documentação é atualizada
- [ ] Mensagens de commit seguem convenção
- [ ] PR tem como alvo o branch `develop`
- [ ] Mudanças quebradas são documentadas
- [ ] Impacto na performance é considerado

## 🆘 Obtendo Ajuda

Precisa de ajuda contribuindo?

- **[GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)** - Faça perguntas
- **[Discord/Slack](#)** - Chat da comunidade em tempo real (se disponível)
- **[Issues](https://github.com/YagoBorba/StackCode/issues)** - Reporte problemas

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos em:

- [Seção de contribuidores](../../README.md#contributors) no README
- Histórico de commits do Git
- Notas de release para contribuições significativas

Obrigado por ajudar a tornar o StackCode melhor! 🚀

---

Para mais detalhes, veja:

- **[README Principal](../../README.md)** - Visão geral do projeto
- **[Guia de Arquitetura](ARCHITECTURE.md)** - Detalhes técnicos
- **[Guia de Auto-hospedagem](SELF_HOSTING_GUIDE.md)** - Opções de deployment
  node packages/cli/dist/index.js --help

  ```

  ```

## 🤝 How to Contribute

### 🐛 Bug Reports

- Check [existing issues](https://github.com/YagoBorba/StackCode/issues) first
- Provide clear reproduction steps
- Include environment details (OS, Node.js version, etc.)
- Use the bug report template

### ✨ Feature Requests

- Open an issue to discuss the feature first
- Explain the use case and benefits
- Consider if it fits the project's scope
- Provide implementation ideas if possible

### 📝 Documentation Improvements

- Fix typos, improve clarity, add examples
- Update docs when adding new features
- Help with translations (see [Internationalization](#internationalization))

### 🛠️ Code Contributions

- Pick up issues labeled `good-first-issue` or `help-wanted`
- Follow the [development workflow](#development-workflow)
- Ensure all tests pass
- Add tests for new functionality

### 🌐 Adding New Technology Stacks

See the comprehensive guide in [main CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-technology-stacks).

## 🔄 Development Workflow

1. **Create a Feature Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

2. **Make Your Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Thoroughly**

   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit Your Changes**

   ```bash
   # Use conventional commits with emojis
   git commit -m "feat(cli): ✨ add new project template"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   # Open PR against develop branch
   ```

## 🎨 Coding Standards

### General Principles

- **Clean Code**: Write readable, maintainable code
- **SOLID Principles**: Follow SOLID design principles
- **Single Responsibility**: Each function/class should have one purpose
- **Documentation**: Use TSDoc comments for public APIs

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Follow ESLint rules

### Testing Requirements

- Add unit tests for new functionality
- Maintain or improve test coverage
- Test both success and error scenarios
- Use descriptive test names

## 🌐 Internationalization

We welcome contributions to support more languages:

### Current Structure

```
packages/i18n/src/locales/
├── en.json          # English (primary)
└── pt.json          # Portuguese
```

### Adding New Languages

1. **Create Locale File**

   ```bash
   # Example for Spanish
   cp packages/i18n/src/locales/en.json packages/i18n/src/locales/es.json
   ```

2. **Translate Strings**

   ```json
   {
     "commands": {
       "init": {
         "description": "Inicializar un nuevo proyecto"
       }
     }
   }
   ```

3. **Test the Translation**
   ```bash
   STACKCODE_LANG=es node packages/cli/dist/index.js --help
   ```

### Future Structure (Planned)

```
docs/
├── pt-BR/           # Portuguese (Brazil)
├── es/              # Spanish
├── fr/              # French
└── de/              # German
```

## 📏 Code Review Process

### For Contributors

- Keep PRs focused and small
- Write clear PR descriptions
- Respond to feedback promptly
- Update documentation as needed

### Review Criteria

- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Adherence to project standards
- Breaking change considerations

## 🏷️ Issue Labels

- `good-first-issue` - Perfect for newcomers
- `help-wanted` - Community help needed
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation related
- `question` - Further information needed

## 📋 Contribution Checklist

Before submitting your PR, ensure:

- [ ] Code follows project standards
- [ ] Tests are added and passing
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR targets the `develop` branch
- [ ] Breaking changes are documented
- [ ] Performance impact is considered

## 🆘 Getting Help

Need help contributing?

- **[GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)** - Ask questions
- **[Discord/Slack](#)** - Real-time community chat (if available)
- **[Issues](https://github.com/YagoBorba/StackCode/issues)** - Report problems

## 🙏 Recognition

All contributors are recognized in:

- [Contributors section](../README.md#contributors) in README
- Git commit history
- Release notes for significant contributions

Thank you for helping make StackCode better! 🚀

---

For more details, see:

- **[Main README](../README.md)** - Project overview
- **[Architecture Guide](ARCHITECTURE.md)** - Technical details
- **[Self-Hosting Guide](SELF_HOSTING_GUIDE.md)** - Deployment options
