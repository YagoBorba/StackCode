# 🎓 Guia do Modo Educacional

O Modo Educacional do StackCode transforma o kit de ferramentas em uma plataforma de aprendizado interativo que ensina melhores práticas de DevOps enquanto você trabalha. Este guia cobre tudo que você precisa saber sobre usar e configurar os recursos educacionais.

## 🌟 Visão Geral

O Modo Educacional fornece explicações contextuais e orientação sobre melhores práticas para cada ação do StackCode. Ele foi projetado para ajudar desenvolvedores a aprenderem o "porquê" por trás das práticas de DevOps, não apenas o "como".

### Principais Benefícios

- **Aprenda Trabalhando**: Obtenha explicações em tempo real para cada ação
- **Melhores Práticas**: Entenda o raciocínio por trás de cada recomendação
- **Onboarding de Equipes**: Perfeito para ajudar novos membros a aprenderem padrões
- **Configurável**: Use globalmente ou sob demanda baseado em suas necessidades
- **Multilíngue**: Disponível em português e inglês

## 🚀 Primeiros Passos

### Configuração Rápida

```bash
# Habilitar modo educacional globalmente
stackcode config set educate true

# Agora todos os comandos mostrarão explicações automaticamente
stackcode validate "feat: nova funcionalidade"
# ✔ Válido: Esta é uma mensagem de commit convencional válida.
# 📚 Commits convencionais ajudam a manter um histórico limpo e permitem automação de releases.
```

### Uso Por Comando

```bash
# Usar modo educacional para um único comando
stackcode validate "feat: nova funcionalidade" --educate
stackcode commit --educate
stackcode init --educate
```

### Configuração Interativa

```bash
# Acessar o menu de configuração
stackcode config
# Selecione "Configurar modo educacional (global)"
```

## ⚙️ Opções de Configuração

### Configuração Global

O modo educacional pode ser habilitado globalmente para que todos os comandos mostrem explicações automaticamente:

```bash
# Habilitar globalmente
stackcode config set educate true

# Desabilitar globalmente
stackcode config set educate false

# Verificar configuração atual
stackcode config get educate
```

### Sobrescrita por Flag de Comando

Mesmo com configurações globais, você pode sobrescrever o comportamento por comando:

```bash
# Forçar modo educacional (mesmo se desabilitado globalmente)
stackcode validate "fix: correção" --educate

# A flag --educate funciona em todos os comandos
stackcode init --educate
stackcode commit --educate
stackcode generate --educate
```

### Comportamento Inteligente

O sistema combina inteligentemente configurações globais com flags de comando:

| Configuração Global | Flag do Comando | Resultado          |
| ------------------- | --------------- | ------------------ |
| `true`              | Não usada       | Mostra explicações |
| `true`              | `--educate`     | Mostra explicações |
| `false`             | Não usada       | Sem explicações    |
| `false`             | `--educate`     | Mostra explicações |

## 📚 Conteúdo Educacional

### O Que é Explicado

O modo educacional fornece contexto para todas as operações principais do StackCode:

#### Inicialização de Projeto (`init`)

- **Decisões de Scaffolding**: Por que estruturas de arquivos específicas são recomendadas
- **Validação de Dependências**: Importância de ter as ferramentas corretas instaladas
- **Arquivos de Configuração**: Propósito de cada arquivo gerado

#### Geração de Arquivos (`generate`)

- **`.gitignore`**: Benefícios de segurança e melhores práticas
- **`README.md`**: Importância da documentação para o sucesso do projeto
- **Escolhas de Template**: Por que templates específicos se adequam a certos casos de uso

#### Fluxo Git (`git`, `commit`)

- **Commits Convencionais**: Benefícios para automação e colaboração
- **Gerenciamento de Branches**: Princípios do GitFlow e coordenação de equipe
- **Controle de Versão**: Melhores práticas para histórico de commits

#### Gerenciamento de Release (`release`)

- **Versionamento Semântico**: Como e por que versões são calculadas
- **Benefícios da Automação**: Reduzindo sobrecarga manual de releases
- **Geração de Changelog**: Mantendo stakeholders informados

#### Validação (`validate`)

- **Quality Gates**: Importância da validação automatizada
- **Padrões de Commit**: Como consistência melhora produtividade da equipe
- **Benefícios de Integração**: Otimização de pipeline CI/CD

### Exemplos de Mensagens Educacionais

```bash
# Criação de .gitignore
💡 Um arquivo .gitignore está sendo criado para impedir que segredos e
   arquivos desnecessários (como node_modules) sejam salvos no repositório.
   Isso mantém seu repositório limpo e seguro.

# Validação de commit convencional
📚 Commits convencionais seguem um padrão que facilita automação e
   compreensão. Formato: tipo(escopo): descrição

# Configuração do Husky
💡 Husky está sendo configurado para automatizar verificações antes dos
   commits. Isso garante que código com problemas não seja enviado para
   o repositório, mantendo a qualidade do código.
```

## 🛠️ Uso Avançado

### Para Líderes de Equipe

O modo educacional é excelente para onboarding e manutenção de padrões:

```bash
# Configurar modo educacional para toda a equipe
echo "educate=true" >> .stackcoderc
# Agora todos recebem explicações por padrão

# Criar diretrizes da equipe
stackcode init --educate > guia-configuracao-equipe.txt
```

### Para Ambientes de Aprendizado

Perfeito para sessões de treinamento e workshops:

```bash
# Habilitar para aprendizado abrangente
stackcode config set educate true

# Percorrer uma configuração completa de projeto com explicações
stackcode init
stackcode generate readme
stackcode commit --dry-run
```

### Integração com CI/CD

O modo educacional pode ser desabilitado em ambientes automatizados:

```bash
# Em scripts de CI/CD, explicitamente desabilitar para reduzir ruído
stackcode validate "$COMMIT_MESSAGE" --no-educate
```

## 🔧 Implementação Técnica

### Arquitetura

O modo educacional é implementado como uma preocupação transversal que se integra com todos os manipuladores de comando:

```typescript
// Cada comando inicializa o modo educacional
initEducationalMode(argv.educate || false);

// Então mostra mensagens contextuais
showEducationalMessage("educational.gitignore_explanation");
showBestPractice("educational.conventional_commits");
showSecurityTip("educational.secrets_warning");
```

### Sistema de Mensagens

- **Internacionalizado**: Suporte completo para múltiplos idiomas
- **Sistema de Fallback**: Mensagens codificadas se traduções falharem
- **Contextual**: Mensagens diferentes baseadas no comando e contexto
- **Ícones Configuráveis**: 💡 para dicas, 📚 para práticas, 🔒 para segurança

### Performance

O modo educacional adiciona sobrecarga mínima:

- Busca de mensagem: ~1ms por mensagem
- Processamento de tradução: Armazenado em cache após primeiro carregamento
- Sem requisições de rede ou dependências externas

## 🌍 Internacionalização

O modo educacional é completamente internacionalizado:

### Idiomas Suportados

- **Inglês** (`en`): Idioma padrão
- **Português** (`pt`): Tradução completa disponível

### Adicionando Novos Idiomas

Para adicionar suporte a idiomas adicionais:

1. Criar novo arquivo de locale em `packages/i18n/src/locales/`
2. Traduzir todas as chaves `educational.*`
3. Testar com `stackcode config set lang <código>`

### Detecção de Idioma

O sistema automaticamente usa o idioma configurado do StackCode:

```bash
# Definir português
stackcode config set lang pt

# Mensagens educacionais agora aparecerão em português
stackcode validate "feat: nova funcionalidade" --educate
# ✔ Válido: Esta é uma mensagem de commit convencional válida.
# 📚 Commits convencionais ajudam a manter um histórico limpo...
```

## 🎯 Melhores Práticas

### Quando Habilitar Globalmente

✅ **Bom para:**

- Ambientes de aprendizado e treinamento
- Novos membros da equipe se familiarizando com práticas
- Equipes estabelecendo novos padrões
- Projetos pessoais onde você quer aprender

❌ **Considere desabilitar para:**

- Equipes experientes com fluxos estabelecidos
- Scripts automatizados e pipelines CI/CD
- Operações de alta frequência onde ruído na saída importa

### Estratégias Efetivas de Aprendizado

1. **Comece com Modo Global**: Habilite globalmente ao primeiro aprender
2. **Transição Gradual**: Mude para uso por comando conforme se familiariza
3. **Padrões de Equipe**: Use para onboarding, então deixe indivíduos escolherem
4. **Documentação**: Capture insights educacionais para documentação da equipe

### Solução de Problemas

#### Mensagens Educacionais Não Aparecem

1. Verificar configuração global: `stackcode config get educate`
2. Verificar se comando suporta modo educacional
3. Verificar configurações de idioma: `stackcode config get lang`
4. Tentar flag explícita: `--educate`

#### Idioma Errado

```bash
# Verificar idioma atual
stackcode config get lang

# Definir idioma correto
stackcode config set lang pt  # ou 'en'
```

#### Preocupações com Performance

O modo educacional é projetado para ser leve, mas se necessário:

```bash
# Desabilitar globalmente
stackcode config set educate false

# Usar seletivamente
stackcode comando --educate  # apenas quando necessário
```

## 📖 Exemplos e Casos de Uso

### Onboarding de Novo Desenvolvedor

```bash
# Dia 1: Habilitar modo educacional
stackcode config set educate true

# Seguir configuração completa de projeto com explicações
stackcode init
# Aprender sobre estrutura do projeto, dependências e melhores práticas

stackcode commit
# Aprender sobre commits convencionais e padrões da equipe

stackcode release
# Entender versionamento e automação de releases
```

### Padronização de Equipe

```bash
# Líder da equipe habilita para todos
echo "educate=true" >> .stackcoderc.json

# Membros da equipe automaticamente recebem explicações
# Não precisam lembrar de flags especiais

# Gradualmente transicionar para uso por comando
# Conforme equipe fica mais experiente
```

### Treinamento e Workshops

```bash
# Configuração do instrutor para aprendizado prático
stackcode config set educate true
stackcode config set lang pt  # se audiência portuguesa

# Estudantes recebem explicações para tudo
# Perfeito para aprender conceitos de DevOps
```

## 🔗 Documentação Relacionada

- **[Guia de Configuração](../CONTRIBUTING.md#configuration)**: Opções completas de configuração
- **[Referência de Comandos](../README.md#commands)**: Todos os comandos disponíveis
- **[Internacionalização](../docs/CONTRIBUTING.md#internationalization)**: Adicionando novos idiomas
- **[Arquitetura](ARCHITECTURE.md#educational-mode)**: Detalhes de implementação técnica

---

_O Modo Educacional faz do StackCode mais que apenas uma ferramenta—torna-se seu mentor DevOps, ensinando melhores práticas enquanto você constrói software incrível._
