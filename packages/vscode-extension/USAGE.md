# StackCode VS Code Extension - Usage Guide

## Getting Started

Once the StackCode extension is installed and activated, it will automatically start monitoring your development workflow and providing proactive suggestions.

## Key Features

### 1. Branch Management Notifications

**Scenario**: You're working directly on the `main`, `master`, or `develop` branch.

**Notification**: 
```
⚠️ You are working on the main branch. Would you like to create a new feature branch?
[Create Branch] [Continue] [Don't Show Again]
```

**Actions**:
- **Create Branch**: Opens an interactive dialog to create a new branch
- **Continue**: Dismisses the notification for this session
- **Don't Show Again**: Permanently disables branch check notifications

### 2. Commit Message Assistance

**Scenario**: You're about to commit without following conventional commit format.

**Notification**:
```
💬 We detected you are trying to commit without a conventional message. Would you like help formatting it?
[Format Message] [Continue] [Learn More]
```

**Actions**:
- **Format Message**: Opens commit message builder
- **Continue**: Allows you to proceed with your current message
- **Learn More**: Opens conventional commits documentation

### 3. Project Structure Suggestions

**Scenario**: Your project is missing important files like README.md or .gitignore.

**Notification**:
```
📁 Your project is missing some important files: README.md, .gitignore. Would you like to generate them?
[Generate Files] [Not Now] [Don't Show Again]
```

## Commands

### Create New Branch (`stackcode.createBranch`)

1. **Access**: Command Palette → "StackCode: Create New Branch"
2. **Input branch name**: Enter name like `user-authentication` or `feature/user-auth`
3. **Select branch type**: Choose from:
   - `feature`: New feature development
   - `bugfix`: Bug fixes
   - `hotfix`: Critical fixes
   - `release`: Release preparation
4. **Result**: Creates and switches to the new branch

### Format Commit Message (`stackcode.formatCommitMessage`)

1. **Access**: Command Palette → "StackCode: Format Commit Message"
2. **Select commit type**: Choose from conventional types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `style`: Code style changes
   - `refactor`: Code refactoring
   - `perf`: Performance improvements
   - `test`: Adding/updating tests
   - `chore`: Maintenance tasks
   - `build`: Build system changes
   - `ci`: CI/CD changes
3. **Enter scope** (optional): Like `auth`, `api`, `ui`
4. **Enter description**: Short description of the change
5. **Result**: Formatted message copied to clipboard

Example output: `feat(auth): add user login functionality`

### Check Best Practices (`stackcode.checkBestPractices`)

1. **Access**: Command Palette → "StackCode: Check Best Practices"
2. **Analysis**: Extension checks:
   - Current branch (warns if on main/develop)
   - Missing project files (README.md, .gitignore)
   - Project structure compliance
3. **Result**: Shows summary of findings and suggestions

## Configuration

### Access Settings
- Open VS Code settings
- Search for "stackcode"
- Or edit `settings.json` directly

### Available Settings

```json
{
  // Enable/disable all proactive notifications
  "stackcode.notifications.enabled": true,
  
  // Show notifications when working on main/develop branch
  "stackcode.notifications.branchCheck": true,
  
  // Show notifications for unconventional commit messages
  "stackcode.notifications.commitCheck": true
}
```

## Best Practices Integration

The extension encourages GitFlow workflow:

1. **Feature Development**:
   - Work on feature branches (`feature/branch-name`)
   - Use conventional commits
   - Include proper documentation

2. **Code Quality**:
   - Maintain project structure
   - Follow naming conventions
   - Include essential project files

3. **Git Workflow**:
   - Avoid direct commits to main/develop
   - Use descriptive commit messages
   - Regular branch cleanup

## Troubleshooting

### Extension Not Showing Notifications

1. Check if notifications are enabled:
   ```json
   "stackcode.notifications.enabled": true
   ```

2. Verify workspace has a git repository
3. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Git Integration Issues

1. Ensure Git extension is enabled
2. Verify repository is properly initialized
3. Check git status in terminal

### Performance Issues

1. Disable specific notification types if needed
2. Check VS Code developer console for errors
3. Restart VS Code

## Advanced Usage

### Custom Workflows

The extension can be extended to support custom workflows:

1. Modify branch naming patterns
2. Add custom commit types
3. Configure project-specific rules

### Integration with Other Tools

- Works alongside GitLens
- Compatible with Git Graph
- Integrates with conventional changelog tools

## Feedback and Support

- Report issues on GitHub
- Suggest new features
- Contribute to development

Remember: The goal is to reinforce best practices without being intrusive. All notifications can be customized or disabled based on your preferences.
