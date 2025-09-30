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
} from "./workflows.js";

export {
  runValidateWorkflow,
  type ValidateWorkflowOptions,
  type ValidateWorkflowProgress,
  type ValidateWorkflowStep,
  type ValidateWorkflowHooks,
  type ValidateWorkflowResult,
} from "./workflows.js";

export {
  runProjectValidateWorkflow,
  type ProjectValidateOptions,
  type ProjectValidateProgress,
  type ProjectValidateStep,
  type ProjectValidateIssue,
  type ProjectValidateResult,
  type ProjectValidateSeverity,
} from "./workflows.js";

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
} from "./workflows.js";

export {
  runReleaseWorkflow,
  type ReleaseWorkflowOptions,
  type ReleaseWorkflowHooks,
  type ReleaseWorkflowProgress,
  type ReleaseWorkflowStep,
  type ReleaseWorkflowResult,
  type ReleaseWorkflowGitHubInfo,
} from "./workflows.js";
