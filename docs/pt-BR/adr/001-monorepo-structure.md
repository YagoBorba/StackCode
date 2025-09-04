# ADR-001: Estrutura Monorepo

## Status
Aceito

## Contexto
O StackCode consiste em múltiplos pacotes relacionados que compartilham funcionalidade comum:
- Uma ferramenta CLI para uso em linha de comando
- Uma extensão VS Code para integração com IDE
- Lógica de negócio principal que ambas as interfaces usam
- Suporte de internacionalização em todos os componentes

Precisávamos decidir como organizar esses pacotes relacionados mas distintos de uma forma que:
- Permita compartilhamento de código entre pacotes
- Mantenha limites claros entre componentes
- Simplifique o gerenciamento de dependências
- Facilite releases coordenados
- Reduza a complexidade de desenvolvimento

## Decisão
Usaremos uma estrutura monorepo com os seguintes pacotes:
- `@stackcode/cli` - Interface de linha de comando
- `@stackcode/core` - Lógica de negócio compartilhada e utilitários
- `@stackcode/i18n` - Suporte de internacionalização
- `stackcode-vscode` - Extensão VS Code

O monorepo será gerenciado usando npm workspaces, fornecendo:
- Gerenciamento compartilhado de dependências
- Linking entre pacotes
- Processos de build coordenados
- Estratégia de versionamento unificada

## Consequências

### Positivas
- **Reutilização de Código**: Lógica de negócio principal pode ser compartilhada entre CLI e extensão VS Code
- **APIs Consistentes**: Todos os pacotes usam as mesmas interfaces e tipos subjacentes
- **Desenvolvimento Simplificado**: Checkout de repositório único fornece acesso a todos os componentes
- **Releases Coordenados**: Todos os pacotes podem ser versionados e lançados juntos
- **Redução de Duplicação**: Utilitários comuns e tipos são centralizados
- **Testes Mais Fáceis**: Testes de integração podem abranger múltiplos pacotes

### Negativas
- **Complexidade de Build**: Sistema de build deve lidar com múltiplos pacotes e suas dependências
- **Tamanho do Repositório**: Repositório único contém todos os componentes, potencialmente aumentando o tamanho
- **Limitações de Ferramentas**: Algumas ferramentas podem não lidar com monorepos de forma otimizada
- **Gerenciamento de Dependências**: Mudanças em pacotes principais afetam todos os dependentes

### Riscos
- **Dependências Circulares**: Deve-se ter cuidado para evitar referências circulares entre pacotes
- **Ordem de Build**: Ordem de build dos pacotes se torna importante
- **Coordenação de Versão**: Todos os pacotes tipicamente precisam ser versionados juntos

### Estratégias de Mitigação
- Usar referências de projeto TypeScript para lidar com dependências de build
- Implementar limites e interfaces claros entre pacotes
- Usar npm workspaces para gerenciamento de dependências
- Estabelecer diretrizes claras para dependências entre pacotes
