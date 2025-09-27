# StackCode VS Code Extension

> **🚀 Complete Development Assistant**: StackCode brings all CLI functionality directly into VS Code with proactive notifications and intelligent suggestions.

## Overview

The StackCode VS Code extension is a comprehensive development assistant that integrates all StackCode CLI functionality directly into your editor. It provides proactive notifications, intelligent suggestions, and seamless project management to enforce best practices and streamline your development workflow.

## Features

### 🔄 Complete CLI Integration

All StackCode CLI commands are available directly in VS Code:

- **Project Initialization**: Create new projects with scaffolding
- **File Generation**: Generate README.md, .gitignore, and other files
- **Git Workflow**: Simplified Gitflow with branch management
- **Conventional Commits**: Interactive commit message builder
- **Project Validation**: Structure and best practices validation
- **Release Management**: Automated versioning and releases
- **Configuration**: Project and extension settings management

### 🔔 Proactive Notifications

The extension actively monitors your development workflow and provides contextual suggestions:

#### Branch Management

- **Main Branch Detection**: "You are working on the main branch. Would you like to create a new branch for this feature?"
- **Automatic Branch Creation**: Guided workflow for creating feature/bugfix/hotfix branches
- **Branch Naming Conventions**: Enforces consistent naming patterns

#### Commit Message Assistance

- **Conventional Commit Detection**: "We detected you are trying to commit without a conventional message. Would you like help formatting it?"
- **Interactive Message Builder**: Step-by-step commit message creation
- **Real-time Validation**: Checks commit messages in real-time

#### Project Structure

- **Missing Files Detection**: Suggests creating README.md, .gitignore when missing
- **File Generation**: Quick generation of project files with appropriate templates
- **Best Practices Check**: Full project audit with actionable suggestions

### 🎛️ Commands

- `StackCode: Create New Branch` - Interactive branch creation wizard
- `StackCode: Format Commit Message` - Conventional commit message builder
- `StackCode: Check Best Practices` - Full project best practices audit

### ⚙️ Configuration

```json
{
  "stackcode.notifications.enabled": true,
  "stackcode.notifications.branchCheck": true,
  "stackcode.notifications.commitCheck": true
}
```

## Example Notifications

### Branch Warning

```
⚠️ You are working on the main branch. Would you like to create a new feature branch?
[Create Branch] [Continue] [Don't Show Again]
```

### Commit Message Help

```
💬 We detected you are trying to commit without a conventional message. Would you like help formatting it?
[Format Message] [Continue] [Learn More]
```

### File Suggestions

```
📁 Your project is missing some important files: README.md, .gitignore. Would you like to generate them?
[Generate Files] [Not Now] [Don't Show Again]
```

### Welcome Message

```
🚀 StackCode is now active! Get proactive suggestions to improve your development workflow.
[Learn More] [Settings]
```

## Architecture

The extension is built with a modular architecture:

- **ProactiveNotificationManager**: Core notification system
- **GitMonitor**: Watches git state and branch changes
- **FileMonitor**: Monitors file operations and project structure
- **ConfigurationManager**: Handles extension settings

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or build from source:
   ```bash
   cd packages/vscode-extension
   npm install
   npm run compile
   ```

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
vsce package
```

## Contributing

This extension follows GitFlow development practices. To contribute:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Follow conventional commits: `feat: add new notification type`
4. Submit a pull request

## License

ISC - See [LICENSE](../../LICENSE) for details.
