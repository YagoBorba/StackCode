# Arquitetura do Projeto

Este documento descreve a arquitetura escolhida durante a configuração do projeto.

## Estrutura de Pastas

- `src/`: Contém o código-fonte principal da aplicação.
- `test/`: Inclui os testes automatizados.
- `docs/`: Documentação adicional do projeto.
- `config/`: Arquivos de configuração e ambientes.
- `public/`: Recursos públicos, como imagens e arquivos estáticos.

## Finalidade de Cada Pasta

- **src/**: Onde toda a lógica de negócio e componentes principais residem.
- **test/**: Testes unitários, de integração e end-to-end.
- **docs/**: Documentação técnica, ADRs e guias de uso.
- **config/**: Configurações de ambiente, variáveis e scripts de inicialização.
- **public/**: Arquivos acessíveis diretamente pelo servidor web.

## Melhores Práticas e Referências

- [12 Factor App](https://12factor.net/pt_br/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture](https://dev.to/eduardomoroni/clean-architecture-na-pratica-4e1b)