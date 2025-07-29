/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */
export * from './release.js';
export { runCommand, getCommandOutput } from './utils.js';
export { generateGitignoreContent, generateReadmeContent } from './generators.js';
export { scaffoldProject, setupHusky } from './scaffold.js';
export { validateCommitMessage } from './validator.js';
export * from './git-utils.js';
export declare function helloWorld(): void;
export { detectVersioningStrategy, getRecommendedBump, updateAllVersions, generateChangelog, VersioningStrategy, MonorepoInfo, //teste
PackageInfo, } from './release.js';
