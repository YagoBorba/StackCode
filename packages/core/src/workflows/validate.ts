import fs from "fs/promises";
import path from "path";
import { validateCommitMessage } from "../validator.js";
import { loadStackCodeConfig } from "../utils.js";

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

/**
 * Validates a commit message against Conventional Commits specification.
 *
 * @param options - Contains the commit message to validate
 * @param hooks - Optional progress callback for UI updates
 * @returns Validation result indicating spec compliance
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
  messageKey: string;
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
 * Validates project structure and configuration integrity.
 *
 * Checks for essential files (package.json, .stackcoderc), validates configuration
 * format, and reports issues with appropriate severity levels.
 *
 * @param options - Project path to validate
 * @param hooks - UI callbacks for progress and educational messages
 * @returns Validation result with discovered issues
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

  const gitPath = path.join(options.projectPath, ".git");
  if (!(await fileExists(gitPath))) {
    issues.push({
      id: "missing-git-init",
      messageKey: "validate.project.git_not_initialized",
      severity: "warning",
      filePath: gitPath,
    });
  }

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
    const hasLock =
      (await fileExists(lockPathNpm)) || (await fileExists(lockPathYarn));
    if (!hasLock) {
      issues.push({
        id: "missing-lockfile",
        messageKey: "validate.project.missing_lockfile",
        severity: "warning",
      });
    }

    if (
      config.stack === "node-ts" ||
      config.stack === "react" ||
      config.stack === "angular" ||
      config.stack === "vue" ||
      config.stack === "svelte"
    ) {
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

  if (config.stack === "java") {
    const pom = path.join(options.projectPath, "pom.xml");
    const gradle = path.join(options.projectPath, "build.gradle");
    const gradleKts = path.join(options.projectPath, "build.gradle.kts");
    const hasBuild =
      (await fileExists(pom)) ||
      (await fileExists(gradle)) ||
      (await fileExists(gradleKts));
    if (!hasBuild) {
      issues.push({
        id: "missing-java-build-file",
        messageKey: "validate.project.missing_java_build_file",
        severity: "error",
      });
    }
  }

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
