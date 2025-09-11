# Self-Hosting Guide

This guide explains how to deploy and customize StackCode for your organization, including setting up private instances and customizing the tool for your specific development workflow.

## 🏢 Why Self-Host StackCode?

Self-hosting StackCode provides several benefits for organizations:

- **Customization**: Tailor templates and workflows to your company's standards
- **Security**: Keep your development processes within your infrastructure
- **Control**: Manage updates and features according to your timeline
- **Integration**: Integrate with internal tools and services
- **Compliance**: Meet specific regulatory or security requirements

## 🚀 Deployment Options

### Option 1: Local Development Installation

For development and testing purposes:

```bash
# Clone the repository
git clone https://github.com/YagoBorba/StackCode.git
cd StackCode

# Install dependencies
npm install

# Build the project
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
   export type SupportedStack = "node-js" | "react" | "your-custom-stack"; // Add your stack
   ```

### Basic Configuration

StackCode supports a simple `.stackcoderc.json` configuration file to set project defaults:

```json
// .stackcoderc.json (in project root)
{
  "features": {
    "commitValidation": true
  }
}
```

This configuration currently supports:
- `commitValidation`: Enable/disable conventional commit validation

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

3. **Build Issues**

   ```bash
   # Check if templates are properly copied
   npm run build
   ls packages/core/dist/templates/

   # Verify build output
   npm test
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
