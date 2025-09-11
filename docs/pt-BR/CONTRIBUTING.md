# Guia de Contribuição

Obrigado por considerar contribuir com o StackCode! Este guia fornece todas as informações necessárias para contribuir efetivamente com o projeto.

## 📋 Navegação Rápida

- **[Visão Geral da Arquitetura](#visão-geral-da-arquitetura)** - Entenda a estrutura do projeto
- **[Configuração de Desenvolvimento](#configuração-de-desenvolvimento)** - Prepare seu ambiente
- **[Como Contribuir](#como-contribuir)** - Diferentes formas de contribuir
- **[Padrões de Código](#padrões-de-código)** - Siga nossas diretrizes
- **[Internacionalização](#internacionalização)** - Ajude com traduções

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
- Ajude com traduções (veja [Internacionalização](#internacionalização))

### 🛠️ Contribuições de Código

- Escolha issues marcadas com `good-first-issue` ou `help-wanted`
- Siga o [fluxo de trabalho de desenvolvimento](#fluxo-de-trabalho-de-desenvolvimento)
- Garanta que todos os testes passem
- Adicione testes para nova funcionalidade

### 🌐 Adicionando Novos Stacks de Tecnologia

Veja o guia abrangente em [CONTRIBUTING.md principal](../../CONTRIBUTING.md#adding-new-technology-stacks).

**Importante**: Ao adicionar novos stacks, garanta que você atualize o sistema de validação de dependências:

- Adicionando dependências do stack a `getStackDependencies()` em `packages/core/src/utils.ts`
- Adicionando instruções de instalação aos arquivos i18n (`packages/i18n/src/locales/`)
- Testando o fluxo de validação com e sem as ferramentas necessárias instaladas

## 🔄 Fluxo de Trabalho de Desenvolvimento

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

## 🎨 Padrões de Código

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
