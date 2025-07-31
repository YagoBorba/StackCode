/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */
export { runCommand, getCommandOutput } from './utils.js';
export { generateGitignoreContent, generateReadmeContent } from './generators.js';
export { scaffoldProject, setupHusky, type ProjectOptions } from './scaffold.js';
export { validateCommitMessage } from './validator.js';
export * from './github.js';
export { detectVersioningStrategy, getRecommendedBump, updateAllVersions, generateChangelog, findChangedPackages, determinePackageBumps, updatePackageVersion, performReleaseCommit, type VersioningStrategy, type MonorepoInfo, type PackageInfo, type PackageBumpInfo, } from './release.js';
