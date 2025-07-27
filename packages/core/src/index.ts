/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */

export * from './release.js';
export { runCommand, getCommandOutput } from './utils.js';
export { generateGitignoreContent, generateReadmeContent } from './generators.js';
export { scaffoldProject, setupHusky } from './scaffold.js';
export { validateCommitMessage } from './validator.js';

export { 
    detectVersioningStrategy, 
    getRecommendedBump,
    updateAllVersions,
    generateChangelog,
    VersioningStrategy, 
    MonorepoInfo,
    PackageInfo,
} from './release.js';