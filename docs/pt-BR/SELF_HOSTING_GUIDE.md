# Guia de Auto-hospedagem

Este guia explica como implantar e personalizar o StackCode para sua organização, incluindo configurar instâncias privadas e personalizar a ferramenta para seu fluxo de trabalho de desenvolvimento específico.

## 🏢 Por que Auto-hospedar o StackCode?

Auto-hospedar o StackCode fornece vários benefícios para organizações:

- **Personalização**: Adapte templates e fluxos de trabalho aos padrões da sua empresa
- **Segurança**: Mantenha seus processos de desenvolvimento dentro da sua infraestrutura
- **Controle**: Gerencie atualizações e recursos de acordo com seu cronograma
- **Integração**: Integre com ferramentas e serviços internos
- **Conformidade**: Atenda requisitos regulamentares ou de segurança específicos

## 🚀 Opções de Implantação

### Opção 1: Instalação de Desenvolvimento Local

Para fins de desenvolvimento e teste:

```bash
# Clonar o repositório
git clone https://github.com/YagoBorba/StackCode.git
cd StackCode

# Instalar dependências
npm install

# Construir o projeto
npm run build

# Vincular para uso global
cd packages/cli
npm link
```

### Opção 2: Espelho de Registro NPM

Para organizações com registros NPM privados:

1. **Fork do Repositório**

   ```bash
   git clone https://github.com/sua-org/StackCode.git
   cd StackCode
   ```

2. **Personalizar Configuração do Pacote**

   ```json
   // Em packages/cli/package.json
   {
     "name": "@sua-org/stackcode-cli",
     "publishConfig": {
       "registry": "https://seu-registro-npm.com"
     }
   }
   ```

3. **Construir e Publicar**
   ```bash
   npm run build
   npm publish --registry https://seu-registro-npm.com
   ```

### Opção 3: Implantação Docker

Criar uma versão containerizada para implantações consistentes:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install && npm run build
RUN npm link packages/cli

ENTRYPOINT ["stc"]
```

```bash
# Construir e usar
docker build -t sua-org/stackcode .
docker run -it sua-org/stackcode init
```

## 🔧 Opções de Personalização

### Personalização de Templates

1. **Adicionar Templates Personalizados**

   ```bash
   # Criar templates da sua organização
   mkdir packages/core/src/templates/seu-stack-org

   # Adicionar arquivos de template com extensão .tpl
   # Use {{nomeVariavel}} para substituições
   ```

2. **Modificar Templates Existentes**

   ```bash
   # Editar templates existentes em packages/core/src/templates/
   # Atualizar dependências package.json
   # Modificar estruturas de pastas
   ```

3. **Atualizar Definições de Tipo**
   ```typescript
   // Em packages/core/src/types.ts
   export type SupportedStack = "node-js" | "react" | "seu-stack-personalizado"; // Adicionar seu stack
   ```

### Internacionalização

Adicione suporte para os idiomas da sua organização:

```bash
# Adicionar novos arquivos de locale
echo '{"welcome": "Bienvenido"}' > packages/i18n/src/locales/es.json
echo '{"welcome": "Willkommen"}' > packages/i18n/src/locales/de.json
```

## 🔒 Considerações de Segurança

### Processo de Revisão de Código

1. **Fork e Revisão**: Sempre faça fork do repositório e revise mudanças
2. **Escaneamento de Dependências**: Escaneie regularmente dependências por vulnerabilidades
3. **Controle de Acesso**: Restrinja quem pode modificar templates e configurações

### Segurança de Rede

1. **Registros Privados**: Use registros NPM privados para pacotes internos
2. **Acesso VPN**: Requeira VPN para acessar instâncias internas do StackCode
3. **Log de Auditoria**: Registre todas as gerações e modificações de templates

### Segurança de Templates

1. **Sanitizar Entradas**: Valide todas as entradas do usuário em templates
2. **Restringir Acesso a Arquivos**: Limite acesso do template ao sistema de arquivos
3. **Revisar Templates de Código**: Revise todos os templates personalizados por questões de segurança

## 🔄 Gerenciamento de Atualizações

### Estratégia de Versionamento

1. **Versionamento Semântico**: Siga semver para a versão da sua organização
2. **Notas de Release**: Mantenha changelog detalhado para releases internos
3. **Pipeline de Testes**: Teste todas as mudanças antes de implantar para equipes

### Processo de Atualização

```bash
# Atualizar do upstream
git remote add upstream https://github.com/YagoBorba/StackCode.git
git fetch upstream
git merge upstream/develop

# Revisar mudanças e testar
npm test
npm run build

# Implantar para sua organização
npm publish --registry https://seu-registro-npm.com
```

## 🛠️ Solução de Problemas

### Problemas Comuns

1. **Erros de Permissão**

   ```bash
   # Corrigir permissões NPM
   sudo chown -R $(whoami) ~/.npm
   npm config set prefix ~/.npm-global
   ```

2. **Template Não Encontrado**

   ```bash
   # Verificar localização do template
   ls packages/core/src/templates/

   # Verificar saída do build
   ls packages/core/dist/templates/
   ```

3. **Problemas de Registro**

   ```bash
   # Verificar configuração do registro
   npm config get registry

   # Testar conectividade do registro
   npm ping --registry https://seu-registro.com
   ```

### Suporte e Manutenção

1. **Documentação Interna**: Manter documentação específica da organização
2. **Canais de Suporte**: Configurar canais de suporte internos para questões do StackCode
3. **Atualizações Regulares**: Agendar atualizações regulares do repositório upstream

## 📋 Checklist de Implantação

- [ ] Repositório forkado e personalizado
- [ ] Templates personalizados criados e testados
- [ ] Arquivos de configuração distribuídos para equipes
- [ ] Registro privado configurado (se aplicável)
- [ ] Revisão de segurança concluída
- [ ] Treinamento de equipe conduzido
- [ ] Monitoramento e logging configurados
- [ ] Processo de atualização documentado
- [ ] Processo de suporte estabelecido

## 🤝 Contribuindo de Volta

Considere contribuir melhorias de volta para o projeto principal StackCode:

1. **Recursos Genéricos**: Submeta recursos que beneficiem todos os usuários
2. **Correções de Bug**: Reporte e corrija bugs encontrados durante auto-hospedagem
3. **Documentação**: Melhore documentação baseada em sua experiência

## 📞 Suporte

Para suporte de auto-hospedagem:

- **Comunidade**: [GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)
- **Issues**: [GitHub Issues](https://github.com/YagoBorba/StackCode/issues)
- **Documentação**: [Documentação Principal](../../README.md)

---

_Para mais informações sobre arquitetura e desenvolvimento do StackCode, veja o [Guia de Arquitetura](ARCHITECTURE.md)._

# Link for global usage

cd packages/cli
npm link

````

### Option 2: NPM Registry Mirror

For organizations with private NPM registries:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-org/StackCode.git
   cd StackCode
````

2. **Customize Package Configuration**

   ```json
   // In packages/cli/package.json
   {
     "name": "@your-org/stackcode-cli",
     "publishConfig": {
       "registry": "https://your-npm-registry.com"
     }
   }
   ```

3. **Build and Publish**
   ```bash
   npm run build
   npm publish --registry https://your-npm-registry.com
   ```

### Option 3: Docker Deployment

Create a containerized version for consistent deployments:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install && npm run build
RUN npm link packages/cli

ENTRYPOINT ["stc"]
```

```bash
# Build and use
docker build -t your-org/stackcode .
docker run -it your-org/stackcode init
```

## 🔧 Customization Options

### Template Customization

1. **Add Custom Templates**

   ```bash
   # Create your organization's templates
   mkdir packages/core/src/templates/your-org-stack

   # Add template files with .tpl extension
   # Use {{variableName}} for replacements
   ```

2. **Modify Existing Templates**

   ```bash
   # Edit existing templates in packages/core/src/templates/
   # Update package.json dependencies
   # Modify folder structures
   ```

3. **Update Type Definitions**
   ```typescript
   // In packages/core/src/types.ts
   export type SupportedStack = "node-js" | "react" | "your-custom-stack"; // Add your stack
   ```

### Internationalization

Add support for your organization's languages:

```bash
# Add new locale files
echo '{"welcome": "Bienvenido"}' > packages/i18n/src/locales/es.json
echo '{"welcome": "Willkommen"}' > packages/i18n/src/locales/de.json
```

## ️ Troubleshooting

### Common Issues

1. **Permission Errors**

   ```bash
   # Fix NPM permissions
   sudo chown -R $(whoami) ~/.npm
   npm config set prefix ~/.npm-global
   ```

2. **Template Not Found**

   ```bash
   # Verify template location
   ls packages/core/src/templates/

   # Check build output
   ls packages/core/dist/templates/
   ```

3. **Registry Issues**

   ```bash
   # Check registry configuration
   npm config get registry

   # Test registry connectivity
   npm ping --registry https://your-registry.com
   ```

## 📋 Deployment Checklist

- [ ] Repository forked and customized
- [ ] Custom templates created and tested
- [ ] Build process completed successfully
- [ ] Tests passing
- [ ] Documentation updated for customizations

## 🤝 Contributing Back

Consider contributing improvements back to the main StackCode project:

1. **Generic Features**: Submit features that benefit all users
2. **Bug Fixes**: Report and fix bugs found during self-hosting
3. **Documentation**: Improve documentation based on your experience

## 📞 Support

For self-hosting support:

- **Community**: [GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)
- **Issues**: [GitHub Issues](https://github.com/YagoBorba/StackCode/issues)
- **Documentation**: [Main Documentation](../README.md)

---

_For more information about StackCode architecture and development, see the [Architecture Guide](ARCHITECTURE.md)._
