/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */
export { validateCommitMessage } from './validator';
export { generateGitignoreContent, generateReadmeContent } from './generators';
export { scaffoldProject, setupHusky, ProjectOptions } from './scaffold';
export { runCommand } from './utils';
