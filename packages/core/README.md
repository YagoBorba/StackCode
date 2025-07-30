
# @stackcode/core

This package is the core engine of the StackCode toolkit. It contains all the business logic for project scaffolding, file generation, Git operations, and the release process, completely decoupled from the command-line interface.

## ⚠️ Important Note

This is primarily an internal package, designed to be consumed by `@stackcode/cli`. However, it can also be used as a standalone library in other Node.js projects or scripts that require its automation capabilities.

## API Reference

Here are the main functions exported by this package:

---

### Scaffolding

#### `scaffoldProject(options: ProjectOptions): Promise<void>`
Creates a complete project directory structure from predefined templates.

- **`options`**: An object containing:
    - `projectPath: string`: The absolute path where the project will be created.
    - `stack: 'node-ts'`: The technology stack to use.
    - `features: ('docker' | 'husky')[]`: An array of additional features.
    - `replacements: Record<string, string>`: Placeholders to replace in `.tpl` files.

#### `setupHusky(projectPath: string): Promise<void>`
Configures Husky git hooks in the specified project directory.

---

### Generators

#### `generateGitignoreContent(technologies: string[]): Promise<string>`
Intelligently combines multiple `.tpl` files to generate a comprehensive `.gitignore` file.

- **`technologies`**: An array of technologies (e.g., `['node-ts', 'ides']`). The function will find corresponding `.tpl` files and concatenate them.

**Example:**
```typescript
import { generateGitignoreContent } from '@stackcode/core';

const content = await generateGitignoreContent(['node-ts', 'ides', 'docker']);
```
---

### Release Automation

#### `detectVersioningStrategy(startPath: string): Promise<MonorepoInfo>`
Analyzes a monorepo to determine if it uses a "locked" or "independent" versioning strategy.

#### `findChangedPackages(packages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]>`
Compares packages against their last Git tag to find which ones have changed.

#### `getRecommendedBump(projectRoot: string): Promise<string>`
Reads Git history since the last tag and recommends the next semantic version (`patch`, `minor`, or `major`) based on Conventional Commits.

#### `performReleaseCommit(pkgInfo: PackageBumpInfo, projectRoot: string): Promise<void>`
Automates the release process by running `git add`, `git commit`, and `git tag` for a given package release.

---

### Validation

#### `validateCommitMessage(message: string): boolean`
Checks if a string conforms to the Conventional Commits specification.

- **`message`**: The commit message string to validate.
- **Returns**: `true` if valid, `false` otherwise.

---

### Testing

This package is covered by a suite of unit tests using **Vitest**. To run the tests for this specific package, execute the following command from the monorepo root:

```bash
npm run test -w @stackcode/core
```