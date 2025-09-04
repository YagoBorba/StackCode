# Registros de Decisões Arquiteturais (ADRs)

*Esta é uma tradução do documento original em inglês. Para a versão mais atualizada, consulte [docs/adr/README.md](../../adr/README.md).*

---

Esta pasta contém os Registros de Decisões Arquiteturais (ADRs) que documentam as importantes decisões arquiteturais tomadas durante o desenvolvimento do StackCode.

## O que é um ADR?

Um Registro de Decisão Arquitetural (ADR) é um documento que captura uma decisão arquitetural importante feita junto com seu contexto e consequências.

## Formato

Cada ADR segue esta estrutura:

- **Título**: Qual é a decisão arquitetural?
- **Status**: Qual é o status? (Proposto, Aceito, Depreciado, Substituído)
- **Contexto**: Qual é o problema que estamos vendo que está motivando essa decisão ou mudança?
- **Decisão**: Qual é a mudança que estamos propondo ou concordamos em implementar?
- **Consequências**: O que fica mais fácil ou mais difícil de fazer e quaisquer riscos introduzidos por essa mudança?

## Índice

Decisões arquiteturais atualmente documentadas:

- **[ADR-001: Estrutura Monorepo](./001-monorepo-structure.md)** *(⏳ Planejado)* - Decisão de organizar o projeto como um monorepo com npm workspaces
- **[ADR-002: TypeScript e ES Modules](./002-typescript-esm.md)** *(⏳ Planejado)* - Escolha do TypeScript com ESM como stack de desenvolvimento principal
- **[ADR-003: Design da Interface de Linha de Comando](./003-cli-design.md)** *(⏳ Planejado)* - Seleção do framework CLI e arquitetura de comandos
- **[ADR-004: Estratégia de Internacionalização](./004-i18n-strategy.md)** *(⏳ Planejado)* - Abordagem de implementação de suporte multi-idioma

### ADRs Futuros
Decisões arquiteturais adicionais a serem documentadas:
- Arquitetura da Extensão VS Code
- Design do Sistema de Templates
- Estratégia de Integração GitHub
- Processo de Gerenciamento de Releases
- Estratégia de Testes

## Template

```markdown
# ADR-XXX: [Título]

## Status

[Proposto | Aceito | Depreciado | Substituído]

## Contexto

[Descreva o contexto e declaração do problema]

## Decisão

[Descreva a resposta a essas forças]

## Consequências

[Descreva o contexto resultante após aplicar a decisão]
```

## 🤝 Como Contribuir

Para contribuir com as traduções dos ADRs:

1. **Escolha um ADR** da lista acima
2. **Traduza** mantendo a estrutura e formatação
3. **Mantenha** os links técnicos e referências
4. **Abra um Pull Request** com a tradução

Veja o [guia de contribuição](../../CONTRIBUTING.md#internationalization) para mais detalhes.

---

*Para a documentação em inglês, visite [docs/adr/](../../adr/)*
