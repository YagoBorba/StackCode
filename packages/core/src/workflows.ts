import fs from "fs/promises";
import path from "path";
import semver from "semver";
import { scaffoldProject, setupHusky } from "./scaffold.js";
import {
  generateGitignoreContent,
  generateReadmeContent,
} from "./generators.js";
import {
  loadStackCodeConfig,
  runCommand,
  saveStackCodeConfig,
  validateStackDependencies,
} from "./utils.js";
import { validateCommitMessage } from "./validator.js";
import { getCommandOutput } from "./utils.js";
import {
  detectVersioningStrategy,
  findChangedPackages,
  determinePackageBumps,
  getRecommendedBump,
  updateAllVersions,
  updatePackageVersion,
  generateChangelog,
  performReleaseCommit,
} from "./release.js";
import type {
  ProjectOptions,
  StackCodeConfig,
  SupportedStack,
  VersioningStrategy,
  PackageBumpInfo,
} from "./types.js";

export type InitFeature = "docker" | "husky";

export type InitWorkflowStep =
  | "scaffold"
  | "saveConfig"
  | "generateReadme"
  | "generateGitignore"
  | "setupHusky"
  | "initializeGit"
  | "validateDependencies"
  | "installDependencies"
  | "completed";

export interface InitWorkflowOptions {
  projectPath: string;
  projectName: string;
  description: string;
  authorName: string;
  stack: SupportedStack;
  features: InitFeature[];
  commitValidation?: boolean;
}

export interface InitWorkflowProgress {
  step: InitWorkflowStep;
  message?: string;
  data?: Record<string, unknown>;
}

export interface InitWorkflowDependencyDecision {
  stack: SupportedStack;
  missingDependencies: string[];
}

export interface InitWorkflowHooks {
  onProgress?(progress: InitWorkflowProgress): Promise<void> | void;
  onEducationalMessage?(messageKey: string): Promise<void> | void;
  onMissingDependencies?(details: InitWorkflowDependencyDecision):
    | Promise<void>
    | void;
  confirmContinueAfterMissingDependencies?(
    decision: InitWorkflowDependencyDecision,
  ): Promise<boolean> | boolean;
}

export interface InitWorkflowResult {
  status: "completed" | "cancelled";
  projectPath: string;
  dependencyValidation: Awaited<
    ReturnType<typeof validateStackDependencies>
  >;
  dependenciesInstalled: boolean;
  installCommand?: {
    command: string;
    args: string[];
  };
  warnings: string[];
}

export type GenerateFileType = "readme" | "gitignore";

export type GenerateWorkflowStep =
  | "checkingFile"
  | "generatingContent"
  | "writingFile"
  | "completed";

export interface GenerateWorkflowProgress {
  step: GenerateWorkflowStep;
  fileType?: GenerateFileType;
  filePath?: string;
}

export interface GenerateWorkflowOptions {
  projectPath: string;
  files: GenerateFileType[];
  gitignoreTechnologies?: string[];
}

export interface GenerateWorkflowHooks {
  onProgress?(progress: GenerateWorkflowProgress): Promise<void> | void;
  onEducationalMessage?(messageKey: string): Promise<void> | void;
  shouldOverwriteFile?(details: {
    fileType: GenerateFileType;
    filePath: string;
  }): Promise<boolean> | boolean;
  resolveGitignoreTechnologies?(details: {
    projectPath: string;
  }): Promise<string[] | undefined> | string[] | undefined;
}

export type GenerateWorkflowFileStatus =
  | "created"
  | "overwritten"
  | "skipped";

export type GenerateWorkflowFileSkipReason =
  | "overwrite-declined"
  | "error";

export interface GenerateWorkflowFileResult {
  fileType: GenerateFileType;
  filePath: string;
  status: GenerateWorkflowFileStatus;
  reason?: GenerateWorkflowFileSkipReason;
  error?: string;
}

export interface GenerateWorkflowResult {
  status: "completed" | "cancelled";
  files: GenerateWorkflowFileResult[];
  warnings: string[];
}

// ===== Validate Workflow (commit message) =====

export type ValidateWorkflowStep = "validating" | "completed";

export interface ValidateWorkflowProgress {
  step: ValidateWorkflowStep;
}

export interface ValidateWorkflowOptions {
  message: string;
}

export interface ValidateWorkflowHooks {
  onProgress?(progress: ValidateWorkflowProgress): Promise<void> | void;
}

export interface ValidateWorkflowResult {
  isValid: boolean;
}

// ===== Project Validation Workflow =====

export type ProjectValidateSeverity = "info" | "warning" | "error";

export type ProjectValidateStep =
  | "loadingConfig"
  | "checkingFiles"
  | "completed";

export interface ProjectValidateProgress {
  step: ProjectValidateStep;
  message?: string;
}

export interface ProjectValidateIssue {
  id: string;
  messageKey: string; // i18n key
  severity: ProjectValidateSeverity;
  filePath?: string;
}

export interface ProjectValidateOptions {
  projectPath: string;
}

export interface ProjectValidateHooks {
  onProgress?(progress: ProjectValidateProgress): Promise<void> | void;
  onEducationalMessage?(messageKey: string): Promise<void> | void;
}

export interface ProjectValidateResult {
  status: "valid" | "invalid";
  issues: ProjectValidateIssue[];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate basic project structure and configuration.
 */
export async function runProjectValidateWorkflow(
  options: ProjectValidateOptions,
  hooks: ProjectValidateHooks = {},
): Promise<ProjectValidateResult> {
  const report = async (
    step: ProjectValidateStep,
    message?: string,
  ): Promise<void> => {
    if (hooks.onProgress) await hooks.onProgress({ step, message });
  };

  const issues: ProjectValidateIssue[] = [];

  await report("loadingConfig", "loading-config");
  const config = await loadStackCodeConfig(options.projectPath);

  await report("checkingFiles", "core-files");
  // Core files
  const readmePath = path.join(options.projectPath, "README.md");
  if (!(await fileExists(readmePath))) {
    issues.push({
      id: "missing-readme",
      messageKey: "validate.project.missing_readme",
      severity: "warning",
      filePath: readmePath,
    });
  }

  const giPath = path.join(options.projectPath, ".gitignore");
  if (!(await fileExists(giPath))) {
    issues.push({
      id: "missing-gitignore",
      messageKey: "validate.project.missing_gitignore",
      severity: "warning",
      filePath: giPath,
    });
  }

  // Git repo
  const gitPath = path.join(options.projectPath, ".git");
  if (!(await fileExists(gitPath))) {
    issues.push({
      id: "missing-git-init",
      messageKey: "validate.project.git_not_initialized",
      severity: "warning",
      filePath: gitPath,
    });
  }

  // Stack-dependent checks (node stacks)
  const nodeStacks = new Set([
    "node-js",
    "node-ts",
    "react",
    "vue",
    "angular",
    "svelte",
  ]);
  if (config.stack && nodeStacks.has(config.stack as string)) {
    const pkgPath = path.join(options.projectPath, "package.json");
    if (!(await fileExists(pkgPath))) {
      issues.push({
        id: "missing-package-json",
        messageKey: "validate.project.missing_package_json",
        severity: "error",
        filePath: pkgPath,
      });
    }
    const lockPathNpm = path.join(options.projectPath, "package-lock.json");
    const lockPathYarn = path.join(options.projectPath, "yarn.lock");
    const hasLock = (await fileExists(lockPathNpm)) || (await fileExists(lockPathYarn));
    if (!hasLock) {
      issues.push({
        id: "missing-lockfile",
        messageKey: "validate.project.missing_lockfile",
        severity: "warning",
      });
    }

    // Node with TypeScript: check tsconfig.json (warning only)
    if (config.stack === "node-ts" || config.stack === "react" || config.stack === "angular" || config.stack === "vue" || config.stack === "svelte") {
      const tsconfigPath = path.join(options.projectPath, "tsconfig.json");
      if (!(await fileExists(tsconfigPath))) {
        issues.push({
          id: "missing-tsconfig",
          messageKey: "validate.project.missing_tsconfig",
          severity: "warning",
          filePath: tsconfigPath,
        });
      }
    }
  }

  // Python
  if (config.stack === "python") {
    const pyproject = path.join(options.projectPath, "pyproject.toml");
    const reqs = path.join(options.projectPath, "requirements.txt");
    const hasPyproject = await fileExists(pyproject);
    const hasReqs = await fileExists(reqs);
    if (!hasPyproject && !hasReqs) {
      issues.push({
        id: "missing-pyproject-or-requirements",
        messageKey: "validate.project.missing_pyproject_or_requirements",
        severity: "error",
      });
    }
  }

  // Java
  if (config.stack === "java") {
    const pom = path.join(options.projectPath, "pom.xml");
    const gradle = path.join(options.projectPath, "build.gradle");
    const gradleKts = path.join(options.projectPath, "build.gradle.kts");
    const hasBuild = (await fileExists(pom)) || (await fileExists(gradle)) || (await fileExists(gradleKts));
    if (!hasBuild) {
      issues.push({
        id: "missing-java-build-file",
        messageKey: "validate.project.missing_java_build_file",
        severity: "error",
      });
    }
  }

  // Go
  if (config.stack === "go") {
    const goMod = path.join(options.projectPath, "go.mod");
    if (!(await fileExists(goMod))) {
      issues.push({
        id: "missing-go-mod",
        messageKey: "validate.project.missing_go_mod",
        severity: "error",
        filePath: goMod,
      });
    }
  }

  // PHP
  if (config.stack === "php") {
    const composer = path.join(options.projectPath, "composer.json");
    const composerLock = path.join(options.projectPath, "composer.lock");
    if (!(await fileExists(composer))) {
      issues.push({
        id: "missing-composer-json",
        messageKey: "validate.project.missing_composer_json",
        severity: "error",
        filePath: composer,
      });
    }
    if (!(await fileExists(composerLock))) {
      issues.push({
        id: "missing-composer-lock",
        messageKey: "validate.project.missing_composer_lock",
        severity: "warning",
        filePath: composerLock,
      });
    }
  }

  // Husky checks
  if (config.features?.husky) {
    const huskyDir = path.join(options.projectPath, ".husky");
    const hasHusky = await fileExists(huskyDir);
    if (!hasHusky) {
      issues.push({
        id: "missing-husky",
        messageKey: "validate.project.missing_husky",
        severity: "warning",
        filePath: huskyDir,
      });
    } else if (config.features?.commitValidation) {
      const commitHook = path.join(huskyDir, "commit-msg");
      if (!(await fileExists(commitHook))) {
        issues.push({
          id: "missing-commit-msg-hook",
          messageKey: "validate.project.missing_commit_msg_hook",
          severity: "warning",
          filePath: commitHook,
        });
      }
    }
  }

  await report("completed", "completed");

  const hasError = issues.some((i) => i.severity === "error");
  return {
    status: hasError ? "invalid" : "valid",
    issues,
  };
}

interface InstallCommand {
  command: string;
  args: string[];
}

const STACK_INSTALL_COMMANDS: Record<SupportedStack, InstallCommand> = {
  "node-js": { command: "npm", args: ["install"] },
  "node-ts": { command: "npm", args: ["install"] },
  react: { command: "npm", args: ["install"] },
  vue: { command: "npm", args: ["install"] },
  angular: { command: "npm", args: ["install"] },
  svelte: { command: "npm", args: ["install"] },
  python: { command: "pip", args: ["install", "-e", "."] },
  java: { command: "mvn", args: ["install"] },
  go: { command: "go", args: ["mod", "tidy"] },
  php: { command: "composer", args: ["install"] },
};

/**
 * Runs the initialization workflow, orchestrating project scaffolding and setup.
 * @param options - Collected user options for project creation.
 * @param hooks - UI hooks for progress reporting and user confirmations.
 * @returns Workflow result containing execution metadata.
 */
export async function runInitWorkflow(
  options: InitWorkflowOptions,
  hooks: InitWorkflowHooks = {},
): Promise<InitWorkflowResult> {
  const reportProgress = async (
    step: InitWorkflowStep,
    data?: Record<string, unknown>,
  ): Promise<void> => {
    if (hooks.onProgress) {
      await hooks.onProgress({ step, data });
    }
  };

  const sendEducationalMessage = async (messageKey: string): Promise<void> => {
    if (hooks.onEducationalMessage) {
      await hooks.onEducationalMessage(messageKey);
    }
  };

  const projectOptions: ProjectOptions = {
    projectPath: options.projectPath,
    stack: options.stack,
    features: options.features,
    replacements: {
      projectName: options.projectName,
      description: options.description,
      authorName: options.authorName,
    },
  };

  await reportProgress("scaffold");
  await sendEducationalMessage("educational.scaffold_explanation");
  await scaffoldProject(projectOptions);

  if (
    options.features.includes("husky") &&
    typeof options.commitValidation !== "undefined"
  ) {
    await reportProgress("saveConfig");
    const config: StackCodeConfig = {
      defaultAuthor: options.authorName,
      defaultLicense: "MIT",
      defaultDescription: options.description,
      stack: options.stack,
      features: {
        commitValidation: options.commitValidation,
        husky: options.features.includes("husky"),
        docker: options.features.includes("docker"),
      },
    };
    await saveStackCodeConfig(options.projectPath, config);
  }

  await reportProgress("generateReadme");
  await sendEducationalMessage("educational.readme_explanation");
  const readmeContent = await generateReadmeContent();
  await fs.writeFile(
    path.join(options.projectPath, "README.md"),
    readmeContent,
  );

  await reportProgress("generateGitignore");
  await sendEducationalMessage("educational.gitignore_explanation");
  const gitignoreContent = await generateGitignoreContent([options.stack]);
  await fs.writeFile(
    path.join(options.projectPath, ".gitignore"),
    gitignoreContent,
  );

  if (options.features.includes("husky")) {
    await reportProgress("setupHusky");
    await sendEducationalMessage("educational.husky_explanation");
    await setupHusky(options.projectPath);
  }

  await reportProgress("initializeGit");
  await sendEducationalMessage("educational.git_init_explanation");
  await runCommand("git", ["init"], { cwd: options.projectPath });

  await reportProgress("validateDependencies");
  await sendEducationalMessage(
    "educational.dependency_validation_explanation",
  );
  const dependencyValidation = await validateStackDependencies(options.stack);

  let shouldContinue = true;
  const warnings: string[] = [];
  let dependenciesInstalled = false;
  let installCommand: InstallCommand | undefined;

  if (!dependencyValidation.isValid) {
    const decision: InitWorkflowDependencyDecision = {
      stack: options.stack,
      missingDependencies: dependencyValidation.missingDependencies,
    };

    if (hooks.onMissingDependencies) {
      await hooks.onMissingDependencies(decision);
    }

    if (hooks.confirmContinueAfterMissingDependencies) {
      shouldContinue = await hooks.confirmContinueAfterMissingDependencies(
        decision,
      );
    }

    if (!shouldContinue) {
      return {
        status: "cancelled",
        projectPath: options.projectPath,
        dependencyValidation,
        dependenciesInstalled: false,
        warnings,
      };
    }
  }

  await reportProgress("installDependencies");
  installCommand = STACK_INSTALL_COMMANDS[options.stack];

  try {
    await runCommand(installCommand.command, installCommand.args, {
      cwd: options.projectPath,
    });
    dependenciesInstalled = true;
  } catch (error) {
    warnings.push(
      error instanceof Error ? error.message : String(error ?? "Unknown error"),
    );
  }

  await reportProgress("completed");

  return {
    status: "completed",
    projectPath: options.projectPath,
    dependencyValidation,
    dependenciesInstalled,
    installCommand,
    warnings,
  };
}

/**
 * Runs the shared file generation workflow, coordinating content creation and writes.
 * @param options - Workflow options describing project path and target files.
 * @param hooks - UI hooks for reporting progress and handling prompts.
 * @returns Workflow result with file outcomes and any warnings produced.
 */
export async function runGenerateWorkflow(
  options: GenerateWorkflowOptions,
  hooks: GenerateWorkflowHooks = {},
): Promise<GenerateWorkflowResult> {
  const reportProgress = async (
    step: GenerateWorkflowStep,
    fileType?: GenerateFileType,
    filePath?: string,
  ): Promise<void> => {
    if (hooks.onProgress) {
      await hooks.onProgress({ step, fileType, filePath });
    }
  };

  const sendEducationalMessage = async (
    messageKey: string,
  ): Promise<void> => {
    if (hooks.onEducationalMessage) {
      await hooks.onEducationalMessage(messageKey);
    }
  };

  const requestedFiles = Array.from(new Set(options.files));
  const warnings: string[] = [];
  const results: GenerateWorkflowFileResult[] = [];

  if (requestedFiles.length === 0) {
    return { status: "cancelled", files: results, warnings };
  }

  for (const fileType of requestedFiles) {
    const filePath = path.join(
      options.projectPath,
      fileType === "readme" ? "README.md" : ".gitignore",
    );

    await reportProgress("checkingFile", fileType, filePath);

    let fileExists = false;
    try {
      await fs.access(filePath);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    if (fileExists) {
      const shouldOverwrite = hooks.shouldOverwriteFile
        ? await hooks.shouldOverwriteFile({ fileType, filePath })
        : false;

      if (!shouldOverwrite) {
        results.push({
          fileType,
          filePath,
          status: "skipped",
          reason: "overwrite-declined",
        });
        continue;
      }
    }

    await reportProgress("generatingContent", fileType, filePath);

    try {
      let content: string;

      if (fileType === "readme") {
        await sendEducationalMessage("educational.readme_explanation");
        content = await generateReadmeContent();
      } else {
        await sendEducationalMessage("educational.gitignore_explanation");

        let technologies = options.gitignoreTechnologies;

        if (!technologies || technologies.length === 0) {
          const resolved = hooks.resolveGitignoreTechnologies
            ? await hooks.resolveGitignoreTechnologies({
                projectPath: options.projectPath,
              })
            : undefined;
          if (resolved && resolved.length > 0) {
            technologies = resolved;
          }
        }

        if (!technologies || technologies.length === 0) {
          const config = await loadStackCodeConfig(options.projectPath);
          const inferredStack = (config as { stack?: string }).stack;
          if (inferredStack) {
            technologies = [inferredStack];
          }
        }

        if (!technologies || technologies.length === 0) {
          warnings.push("generate.warning.gitignore_default");
          technologies = ["node-ts"];
        }

        content = await generateGitignoreContent(technologies);
      }

      await reportProgress("writingFile", fileType, filePath);
      await fs.writeFile(filePath, content);

      results.push({
        fileType,
        filePath,
        status: fileExists ? "overwritten" : "created",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "error");
      warnings.push(message);
      results.push({
        fileType,
        filePath,
        status: "skipped",
        reason: "error",
        error: message,
      });
    }
  }

  await reportProgress("completed");

  const hasSuccessfulFile = results.some(
    (result) => result.status === "created" || result.status === "overwritten",
  );

  return {
    status: hasSuccessfulFile ? "completed" : "cancelled",
    files: results,
    warnings,
  };
}

/**
 * Runs commit message validation with simple progress reporting.
 * @param options - Validate workflow options containing the message.
 * @param hooks - Optional progress hook for UI updates.
 * @returns Result indicating whether the message is valid per Conventional Commits.
 */
export async function runValidateWorkflow(
  options: ValidateWorkflowOptions,
  hooks: ValidateWorkflowHooks = {},
): Promise<ValidateWorkflowResult> {
  if (hooks.onProgress) {
    await hooks.onProgress({ step: "validating" });
  }

  const isValid = validateCommitMessage(options.message);

  if (hooks.onProgress) {
    await hooks.onProgress({ step: "completed" });
  }

  return { isValid };
}

// ===== Commit Workflow =====

export type CommitWorkflowStep =
  | "checkingStaged"
  | "buildingMessage"
  | "committing"
  | "completed";

export interface CommitWorkflowProgress {
  step: CommitWorkflowStep;
  message?: string;
}

export interface CommitWorkflowOptions {
  cwd: string;
  type: string; // feat, fix, etc.
  scope?: string;
  shortDescription: string;
  longDescription?: string; // supports \n separators already
  breakingChanges?: string;
  affectedIssues?: string; // e.g., closes #123
}

export interface CommitWorkflowHooks {
  onProgress?(progress: CommitWorkflowProgress): Promise<void> | void;
}

export interface CommitWorkflowResult {
  status: "committed" | "cancelled";
  reason?: "no-staged-changes" | "error";
  message?: string;
  error?: string;
}

export async function runCommitWorkflow(
  options: CommitWorkflowOptions,
  hooks: CommitWorkflowHooks = {},
): Promise<CommitWorkflowResult> {
  const report = async (p: CommitWorkflowProgress) =>
    hooks.onProgress ? hooks.onProgress(p) : undefined;

  try {
    await report({ step: "checkingStaged" });
    const status = await getCommandOutput(
      "git",
      ["status", "--porcelain"],
      { cwd: options.cwd },
    );
    if (!status) {
      return { status: "cancelled", reason: "no-staged-changes" };
    }

    await report({ step: "buildingMessage" });
    let msg = `${options.type}`;
    if (options.scope) msg += `(${options.scope.trim()})`;
    msg += `: ${options.shortDescription.trim()}`;

    if (options.longDescription) {
      const body = options.longDescription.replace(/\|/g, "\n");
      msg += `\n\n${body}`;
    }
    if (options.breakingChanges) {
      msg += `\n\nBREAKING CHANGE: ${options.breakingChanges.trim()}`;
    }
    if (options.affectedIssues) {
      msg += `\n\n${options.affectedIssues.trim()}`;
    }

    await report({ step: "committing", message: msg });
    await runCommand("git", ["commit", "-m", msg], { cwd: options.cwd });

    await report({ step: "completed" });
    return { status: "committed", message: msg };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e ?? "error");
    return { status: "cancelled", reason: "error", error: err };
  }
}

// ===== Git Start/Finish Workflows =====

export type GitStartWorkflowStep =
  | "switchingBase"
  | "pullingBase"
  | "creatingBranch"
  | "completed";

export interface GitStartWorkflowProgress {
  step: GitStartWorkflowStep;
  message?: string;
}

export interface GitStartWorkflowOptions {
  cwd: string;
  branchName: string;
  branchType: string; // feature, fix, etc.
  baseBranch?: string; // default develop
}

export interface GitStartWorkflowHooks {
  onProgress?(progress: GitStartWorkflowProgress): Promise<void> | void;
}

export interface GitStartWorkflowResult {
  status: "created" | "cancelled";
  fullBranchName?: string;
  error?: string;
}

export async function runGitStartWorkflow(
  options: GitStartWorkflowOptions,
  hooks: GitStartWorkflowHooks = {},
): Promise<GitStartWorkflowResult> {
  const report = async (p: GitStartWorkflowProgress) =>
    hooks.onProgress ? hooks.onProgress(p) : undefined;

  const base = options.baseBranch || "develop";
  const full = `${options.branchType}/${options.branchName}`;
  try {
    await report({ step: "switchingBase", message: base });
    await runCommand("git", ["checkout", base], { cwd: options.cwd });
    await report({ step: "pullingBase", message: base });
    await runCommand("git", ["pull", "origin", base], { cwd: options.cwd });
    await report({ step: "creatingBranch", message: full });
    await runCommand("git", ["checkout", "-b", full], { cwd: options.cwd });
    await report({ step: "completed" });
    return { status: "created", fullBranchName: full };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e ?? "error");
    return { status: "cancelled", error: err };
  }
}

export type GitFinishWorkflowStep = "pushing" | "computingPrUrl" | "completed";

export interface GitFinishWorkflowProgress {
  step: GitFinishWorkflowStep;
  message?: string;
}

export interface GitFinishWorkflowOptions {
  cwd: string;
}

export interface GitFinishWorkflowHooks {
  onProgress?(progress: GitFinishWorkflowProgress): Promise<void> | void;
}

export interface GitFinishWorkflowResult {
  status: "pushed" | "cancelled";
  branch?: string;
  prUrl?: string;
  error?: string;
}

export async function runGitFinishWorkflow(
  options: GitFinishWorkflowOptions,
  hooks: GitFinishWorkflowHooks = {},
): Promise<GitFinishWorkflowResult> {
  const report = async (p: GitFinishWorkflowProgress) =>
    hooks.onProgress ? hooks.onProgress(p) : undefined;

  try {
    const currentBranch = await getCommandOutput(
      "git",
      ["branch", "--show-current"],
      { cwd: options.cwd },
    );
    if (!currentBranch) {
      return { status: "cancelled", error: "not-on-branch" };
    }
    await report({ step: "pushing", message: currentBranch });
    await runCommand(
      "git",
      ["push", "--set-upstream", "origin", currentBranch],
      { cwd: options.cwd },
    );
    await report({ step: "computingPrUrl" });
    const remoteUrl = await getCommandOutput(
      "git",
      ["remote", "get-url", "origin"],
      { cwd: options.cwd },
    );
    const match = remoteUrl.match(/github\.com[\/:]([\w-]+\/[\w-.]+)/);
    const repoPath = match ? match[1].replace(".git", "") : null;
    const prUrl = repoPath
      ? `https://github.com/${repoPath}/pull/new/${currentBranch}`
      : undefined;
    await report({ step: "completed" });
    return { status: "pushed", branch: currentBranch, prUrl };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e ?? "error");
    return { status: "cancelled", error: err };
  }
}

// ===== Release Workflow =====

export type ReleaseWorkflowStep =
  | "detectingStrategy"
  | "lockedRecommendedBump"
  | "lockedUpdatingVersions"
  | "lockedGeneratingChangelog"
  | "independentFindingChanges"
  | "independentDeterminingBumps"
  | "independentPreparingPlan"
  | "independentUpdatingPackages"
  | "independentCommitting"
  | "completed";

export interface ReleaseWorkflowProgress {
  step: ReleaseWorkflowStep;
  message?: string;
}

export interface ReleaseWorkflowOptions {
  cwd: string;
  changelogFilename?: string;
  gitRemote?: string;
  autoCommitIndependent?: boolean;
}

export interface ReleaseWorkflowHooks {
  onProgress?(progress: ReleaseWorkflowProgress): Promise<void> | void;
  confirmLockedRelease?(details: {
    currentVersion: string;
    newVersion: string;
  }): Promise<boolean> | boolean;
  displayIndependentPlan?(plan: PackageBumpInfo[]): Promise<void> | void;
  confirmIndependentRelease?(plan: PackageBumpInfo[]):
    | Promise<boolean>
    | boolean;
}

export interface ReleaseWorkflowGitHubInfo {
  owner: string;
  repo: string;
  remoteUrl: string;
}

export interface ReleaseWorkflowResult {
  status: "prepared" | "cancelled";
  strategy: VersioningStrategy;
  reason?:
    | "invalid-structure"
    | "cancelled-by-user"
    | "no-changes"
    | "no-bumps"
    | "error";
  error?: string;
  newVersion?: string;
  packages?: PackageBumpInfo[];
  releaseNotes?: string;
  tagName?: string;
  github?: ReleaseWorkflowGitHubInfo;
  warnings?: string[];
}

async function resolveGitHubInfo(
  cwd: string,
  remote: string,
): Promise<ReleaseWorkflowGitHubInfo | undefined> {
  try {
    const remoteUrl = await getCommandOutput(
      "git",
      ["remote", "get-url", remote],
      { cwd },
    );
    const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    if (!match) {
      return undefined;
    }
    const [owner, repoWithSuffix] = match[1].split("/");
    const repo = repoWithSuffix.replace(/\.git$/, "");
    return { owner, repo, remoteUrl };
  } catch {
    return undefined;
  }
}

export async function runReleaseWorkflow(
  options: ReleaseWorkflowOptions,
  hooks: ReleaseWorkflowHooks = {},
): Promise<ReleaseWorkflowResult> {
  const report = async (progress: ReleaseWorkflowProgress) => {
    if (hooks.onProgress) {
      await hooks.onProgress(progress);
    }
  };

  const changelogFilename = options.changelogFilename ?? "CHANGELOG.md";
  const gitRemote = options.gitRemote ?? "origin";
  const autoCommitIndependent =
    typeof options.autoCommitIndependent === "boolean"
      ? options.autoCommitIndependent
      : true;

  let currentStrategy: VersioningStrategy = "unknown";

  try {
    await report({ step: "detectingStrategy" });
    const monorepoInfo = await detectVersioningStrategy(options.cwd);
    currentStrategy = monorepoInfo.strategy;

    if (monorepoInfo.strategy === "unknown") {
      return {
        status: "cancelled",
        strategy: monorepoInfo.strategy,
        reason: "invalid-structure",
      };
    }

    if (monorepoInfo.strategy === "locked") {
      await report({ step: "lockedRecommendedBump" });
      const bumpType = await getRecommendedBump(monorepoInfo.rootDir);
      const currentVersion = monorepoInfo.rootVersion ?? "0.0.0";
      const nextVersion = semver.inc(
        currentVersion,
        bumpType as semver.ReleaseType,
      );
      if (!nextVersion) {
        return {
          status: "cancelled",
          strategy: "locked",
          reason: "error",
          error: "Unable to calculate next version",
        };
      }

      let shouldProceed = true;
      if (hooks.confirmLockedRelease) {
        shouldProceed = await hooks.confirmLockedRelease({
          currentVersion,
          newVersion: nextVersion,
        });
      }

      if (!shouldProceed) {
        return {
          status: "cancelled",
          strategy: "locked",
          reason: "cancelled-by-user",
          newVersion: nextVersion,
        };
      }

      await report({ step: "lockedUpdatingVersions" });
      await updateAllVersions(monorepoInfo, nextVersion);

      await report({ step: "lockedGeneratingChangelog" });
      const changelog = await generateChangelog(monorepoInfo);
      const changelogPath = path.join(options.cwd, changelogFilename);
      const existing = await fs.readFile(changelogPath, "utf-8").catch(() => "");
      await fs.writeFile(
        changelogPath,
        existing ? `${changelog}\n${existing}` : `${changelog}\n`,
      );

      const github = await resolveGitHubInfo(options.cwd, gitRemote);

      await report({ step: "completed" });
      return {
        status: "prepared",
        strategy: "locked",
        newVersion: nextVersion,
        releaseNotes: changelog,
        tagName: `v${nextVersion}`,
        github,
      };
    }

    // Independent strategy
    await report({ step: "independentFindingChanges" });
    const changedPackages = await findChangedPackages(
      monorepoInfo.packages,
      monorepoInfo.rootDir,
    );

    if (changedPackages.length === 0) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "no-changes",
      };
    }

    await report({ step: "independentDeterminingBumps" });
    const packagesToUpdate = await determinePackageBumps(changedPackages);

    if (packagesToUpdate.length === 0) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "no-bumps",
      };
    }

    await report({ step: "independentPreparingPlan" });
    if (hooks.displayIndependentPlan) {
      await hooks.displayIndependentPlan(packagesToUpdate);
    }

    let shouldContinue = true;
    if (hooks.confirmIndependentRelease) {
      shouldContinue = await hooks.confirmIndependentRelease(packagesToUpdate);
    }

    if (!shouldContinue) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "cancelled-by-user",
        packages: packagesToUpdate,
      };
    }

    await report({ step: "independentUpdatingPackages" });
    const combinedNotes: string[] = [];
    for (const pkgInfo of packagesToUpdate) {
      await updatePackageVersion(pkgInfo);
      const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
      const changelogPath = path.join(pkgInfo.pkg.path, "CHANGELOG.md");
      const existing = await fs
        .readFile(changelogPath, "utf-8")
        .catch(() => "");
      await fs.writeFile(
        changelogPath,
        existing ? `${changelogContent}\n${existing}` : `${changelogContent}\n`,
      );
      combinedNotes.push(
        `### 🎉 Release for ${pkgInfo.pkg.name}@${pkgInfo.newVersion}\n\n${changelogContent}`,
      );
    }

    if (autoCommitIndependent) {
      await report({ step: "independentCommitting" });
      await performReleaseCommit(packagesToUpdate, monorepoInfo.rootDir);
    }

    const releaseNotes = combinedNotes.join("\n\n");
    const primaryPackage =
      packagesToUpdate.find((p) => p.pkg.name === "@stackcode/cli") ||
      packagesToUpdate[0];
    const shortName =
      primaryPackage.pkg.name.split("/")[1] || primaryPackage.pkg.name;
    const tagName = `${shortName}@${primaryPackage.newVersion}`;
    const github = await resolveGitHubInfo(options.cwd, gitRemote);

    await report({ step: "completed" });
    return {
      status: "prepared",
      strategy: "independent",
      packages: packagesToUpdate,
      releaseNotes,
      tagName,
      github,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "cancelled",
      strategy: currentStrategy,
      reason: "error",
      error: message,
    };
  }
}
