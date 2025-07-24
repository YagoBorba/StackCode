/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */

// From validator.ts
export { validateCommitMessage } from './validator';

// From generators.ts
export { generateGitignoreContent, generateReadmeContent } from './generators';

// From scaffold.ts
export { scaffoldProject, setupHusky, ProjectOptions } from './scaffold';

// From utils.ts
export { runCommand } from './utils';