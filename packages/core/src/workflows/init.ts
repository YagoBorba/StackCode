import fs from "fs/promises";
import path from "path";
import { scaffoldProject, setupHusky } from "../scaffold.js";
import {
  generateGitignoreContent,
  generateReadmeContent,
} from "../generators.js";
import {
  runCommand,
  saveStackCodeConfig,
  validateStackDependencies,
} from "../utils.js";
import type {
  ProjectOptions,
  StackCodeConfig,
  SupportedStack,
} from "../types.js";

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
  onMissingDependencies?(
    details: InitWorkflowDependencyDecision,
  ): Promise<void> | void;
  confirmContinueAfterMissingDependencies?(
    decision: InitWorkflowDependencyDecision,
  ): Promise<boolean> | boolean;
}

export interface InitWorkflowResult {
  status: "completed" | "cancelled";
  projectPath: string;
  dependencyValidation: Awaited<ReturnType<typeof validateStackDependencies>>;
  dependenciesInstalled: boolean;
  installCommand?: {
    command: string;
    args: string[];
  };
  warnings: string[];
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
 * Orchestrates the complete project initialization workflow.
 *
 * Creates project structure, generates configuration files, sets up version control,
 * validates stack dependencies, and optionally installs project dependencies.
 *
 * @param options - Project configuration including path, stack, and features
 * @param hooks - UI callbacks for progress reporting and user confirmations
 * @returns Result object with status, warnings, and dependency information
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
  await sendEducationalMessage("educational.dependency_validation_explanation");
  const dependencyValidation = await validateStackDependencies(options.stack);

  let shouldContinue = true;
  const warnings: string[] = [];
  let dependenciesInstalled = false;

  if (!dependencyValidation.isValid) {
    const decision: InitWorkflowDependencyDecision = {
      stack: options.stack,
      missingDependencies: dependencyValidation.missingDependencies,
    };

    if (hooks.onMissingDependencies) {
      await hooks.onMissingDependencies(decision);
    }

    if (hooks.confirmContinueAfterMissingDependencies) {
      shouldContinue =
        await hooks.confirmContinueAfterMissingDependencies(decision);
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
  const installCommand = STACK_INSTALL_COMMANDS[options.stack];

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
