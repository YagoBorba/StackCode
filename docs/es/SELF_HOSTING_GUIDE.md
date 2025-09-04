# Guía de Auto-hospedaje

Esta guía explica cómo desplegar y personalizar StackCode para tu organización, incluyendo configurar instancias privadas y personalizar la herramienta para tu flujo de trabajo de desarrollo específico.

## 🏢 ¿Por qué Auto-hospedar StackCode?

Auto-hospedar StackCode proporciona varios beneficios para las organizaciones:

- **Personalización**: Adaptar plantillas y flujos de trabajo a los estándares de tu empresa
- **Seguridad**: Mantener tus procesos de desarrollo dentro de tu infraestructura
- **Control**: Gestionar actualizaciones y características según tu cronograma
- **Integración**: Integrar con herramientas y servicios internos
- **Cumplimiento**: Cumplir requisitos regulatorios o de seguridad específicos

## 🚀 Opciones de Despliegue

### Opción 1: Instalación de Desarrollo Local

Para propósitos de desarrollo y pruebas:

```bash
# Clonar el repositorio
git clone https://github.com/YagoBorba/StackCode.git
cd StackCode

# Instalar dependencias
npm install

# Construir el proyecto
npm run build

# Link for global usage
cd packages/cli
npm link
```

### Option 2: NPM Registry Mirror

For organizations with private NPM registries:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-org/StackCode.git
   cd StackCode
   ```

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
   export type SupportedStack = 
     | "node-js"
     | "react" 
     | "your-custom-stack"  // Add your stack
   ```

### Configuration Customization

1. **Default Configuration**
   ```json
   // Create .stackcoderc in your users' home directories
   {
     "defaultAuthor": "Your Organization",
     "defaultLicense": "Proprietary",
     "organizationTemplates": true,
     "privateRegistry": "https://your-npm-registry.com"
   }
   ```

2. **Environment Variables**
   ```bash
   # Set organization defaults
   export STACKCODE_DEFAULT_AUTHOR="Your Organization"
   export STACKCODE_PRIVATE_REGISTRY="https://your-npm-registry.com"
   export STACKCODE_TEMPLATE_PATH="/path/to/custom/templates"
   ```

### Internationalization

Add support for your organization's languages:

```bash
# Add new locale files
echo '{"welcome": "Bienvenido"}' > packages/i18n/src/locales/es.json
echo '{"welcome": "Willkommen"}' > packages/i18n/src/locales/de.json
```

## 🔒 Security Considerations

### Code Review Process

1. **Fork and Review**: Always fork the repository and review changes
2. **Dependency Scanning**: Regularly scan dependencies for vulnerabilities
3. **Access Control**: Restrict who can modify templates and configurations

### Network Security

1. **Private Registries**: Use private NPM registries for internal packages
2. **VPN Access**: Require VPN for accessing internal StackCode instances
3. **Audit Logging**: Log all template generations and modifications

### Template Security

1. **Sanitize Inputs**: Validate all user inputs in templates
2. **Restrict File Access**: Limit template file system access
3. **Code Review Templates**: Review all custom templates for security issues

## 🔄 Update Management

### Versioning Strategy

1. **Semantic Versioning**: Follow semver for your organization's version
2. **Release Notes**: Maintain detailed changelog for internal releases
3. **Testing Pipeline**: Test all changes before deploying to teams

### Update Process

```bash
# Update from upstream
git remote add upstream https://github.com/YagoBorba/StackCode.git
git fetch upstream
git merge upstream/develop

# Review changes and test
npm test
npm run build

# Deploy to your organization
npm publish --registry https://your-npm-registry.com
```

## 🏗️ Architecture for Organizations

### Centralized Configuration

```
Organization Setup:
├── stackcode-config/
│   ├── templates/           # Custom organization templates
│   ├── configs/            # Default configurations
│   └── policies/           # Development policies
├── private-registry/       # Internal NPM registry
└── deployment/            # Deployment scripts
```

### Team Integration

1. **Team Templates**: Create templates specific to different teams
2. **Approval Workflows**: Implement approval processes for new templates
3. **Usage Analytics**: Track template usage across teams

## 🛠️ Troubleshooting

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

### Support and Maintenance

1. **Internal Documentation**: Maintain organization-specific documentation
2. **Support Channels**: Set up internal support channels for StackCode issues
3. **Regular Updates**: Schedule regular updates from the upstream repository

## 📋 Deployment Checklist

- [ ] Repository forked and customized
- [ ] Custom templates created and tested
- [ ] Configuration files distributed to teams
- [ ] Private registry configured (if applicable)
- [ ] Security review completed
- [ ] Team training conducted
- [ ] Monitoring and logging set up
- [ ] Update process documented
- [ ] Support process established

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

*For more information about StackCode architecture and development, see the [Architecture Guide](ARCHITECTURE.md).*
