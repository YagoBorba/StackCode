/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */

export {
  runCommand,
  getCommandOutput,
  getErrorMessage,
  isCommandAvailable,
  getStackDependencies,
  validateStackDependencies,
  loadStackCodeConfig,
  saveStackCodeConfig,
} from "./utils.js";
export {
  generateGitignoreContent,
  generateReadmeContent,
} from "./generators.js";
export { scaffoldProject, setupHusky } from "./scaffold.js";
export { validateCommitMessage } from "./validator.js";

export * from "./github.js";
export * from "./types.js";

export {
  runIssuesWorkflow,
  clearIssuesCache,
  clearExpiredIssuesCache,
  clearRepositoryCache,
  getIssuesCacheSize,
  getIssuesCacheStats,
  type IssuesWorkflowRepository,
  type IssuesWorkflowOptions,
  type IssuesWorkflowResult,
  type IssuesWorkflowStep,
  type IssuesWorkflowProgress,
  type IssuesWorkflowHooks,
  type IssuesCacheStats,
} from "./issues-workflow.js";

export {
  detectVersioningStrategy,
  getRecommendedBump,
  updateAllVersions,
  generateChangelog,
  findChangedPackages,
  determinePackageBumps,
  updatePackageVersion,
  performReleaseCommit,
} from "./release.js";

export {
  runInitWorkflow,
  type InitFeature,
  type InitWorkflowStep,
  type InitWorkflowOptions,
  type InitWorkflowProgress,
  type InitWorkflowDependencyDecision,
  type InitWorkflowHooks,
  type InitWorkflowResult,
} from "./workflows/init.js";

export {
  runGenerateWorkflow,
  type GenerateFileType,
  type GenerateWorkflowStep,
  type GenerateWorkflowOptions,
  type GenerateWorkflowProgress,
  type GenerateWorkflowHooks,
  type GenerateWorkflowResult,
  type GenerateWorkflowFileResult,
  type GenerateWorkflowFileStatus,
  type GenerateWorkflowFileSkipReason,
} from "./workflows/generate.js";

export {
  runValidateWorkflow,
  type ValidateWorkflowOptions,
  type ValidateWorkflowProgress,
  type ValidateWorkflowStep,
  type ValidateWorkflowHooks,
  type ValidateWorkflowResult,
  runProjectValidateWorkflow,
  type ProjectValidateOptions,
  type ProjectValidateProgress,
  type ProjectValidateStep,
  type ProjectValidateIssue,
  type ProjectValidateResult,
  type ProjectValidateSeverity,
} from "./workflows/validate.js";

export {
  runCommitWorkflow,
  type CommitWorkflowOptions,
  type CommitWorkflowProgress,
  type CommitWorkflowStep,
  type CommitWorkflowHooks,
  type CommitWorkflowResult,
  runGitStartWorkflow,
  type GitStartWorkflowOptions,
  type GitStartWorkflowProgress,
  type GitStartWorkflowStep,
  type GitStartWorkflowHooks,
  type GitStartWorkflowResult,
  runGitFinishWorkflow,
  type GitFinishWorkflowOptions,
  type GitFinishWorkflowProgress,
  type GitFinishWorkflowStep,
  type GitFinishWorkflowHooks,
  type GitFinishWorkflowResult,
} from "./workflows/git.js";

export {
  runReleaseWorkflow,
  type ReleaseWorkflowOptions,
  type ReleaseWorkflowHooks,
  type ReleaseWorkflowProgress,
  type ReleaseWorkflowStep,
  type ReleaseWorkflowResult,
  type ReleaseWorkflowGitHubInfo,
} from "./workflows/release.js";
