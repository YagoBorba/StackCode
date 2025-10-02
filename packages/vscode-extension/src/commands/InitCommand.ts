import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";
import {
  runInitWorkflow,
  type InitFeature,
  type InitWorkflowDependencyDecision,
  type InitWorkflowHooks,
  type InitWorkflowOptions,
  type InitWorkflowProgress,
  type InitWorkflowResult,
  type InitWorkflowStep,
} from "@stackcode/core";
import * as path from "path";

/**
 * Command to initialize a new project through VS Code interface.
 * Provides interactive project setup with stack selection and configuration.
 */
export class InitCommand extends BaseCommand {
  /**
   * Executes the project initialization workflow with user prompts.
   */
  async execute(): Promise<void> {
    try {
      const projectName = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_project_name"),
        placeHolder: t("vscode.init.my_awesome_project"),
        validateInput: (value: string) => {
          if (!value) {
            return t("vscode.init.project_name_required");
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return t("vscode.init.project_name_invalid");
          }
          return null;
        },
      });

      if (!projectName) {
        return;
      }

      const descriptionInput = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_project_description"),
        placeHolder: t("vscode.init.brief_description"),
      });
      const description = descriptionInput ?? "";

      const authorInput = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_author_name"),
        placeHolder: t("vscode.init.your_name"),
        value: await this.getGitUserName(),
      });
      const authorName = authorInput ?? "";

      const stack = await vscode.window.showQuickPick(
        [
          { label: "node-ts", description: t("vscode.init.stacks.node_ts") },
          { label: "react", description: t("vscode.init.stacks.react") },
          { label: "vue", description: t("vscode.init.stacks.vue") },
          { label: "angular", description: t("vscode.init.stacks.angular") },
          { label: "python", description: t("vscode.init.stacks.python") },
          { label: "java", description: t("vscode.init.stacks.java") },
          { label: "go", description: t("vscode.init.stacks.go") },
          { label: "php", description: t("vscode.init.stacks.php") },
        ],
        {
          placeHolder: t("vscode.init.select_project_stack"),
        },
      );

      if (!stack) {
        return;
      }

      type FeatureQuickPickItem = vscode.QuickPickItem & { value: InitFeature };
      const featureItems: FeatureQuickPickItem[] = [
        {
          label: this.safeTranslate(
            "vscode.init.features.docker.label",
            "Docker support",
          ),
          description: this.safeTranslate(
            "vscode.init.features.docker.description",
            "Adds Docker configuration to the project",
          ),
          picked: true,
          value: "docker",
        },
        {
          label: this.safeTranslate(
            "vscode.init.features.husky.label",
            "Husky commit hooks",
          ),
          description: this.safeTranslate(
            "vscode.init.features.husky.description",
            "Installs Husky to enforce commit conventions",
          ),
          picked: true,
          value: "husky",
        },
      ];

      const selectedFeatures = await vscode.window.showQuickPick(featureItems, {
        canPickMany: true,
        placeHolder: this.safeTranslate(
          "init.prompt.features",
          "Select optional features",
        ),
      });

      if (typeof selectedFeatures === "undefined") {
        return;
      }

      const features = (
        selectedFeatures.length > 0
          ? selectedFeatures
          : featureItems.filter((item) => item.picked)
      ).map((item) => item.value as InitFeature);

      let commitValidation: boolean | undefined;
      if (features.includes("husky")) {
        type BooleanQuickPickItem = vscode.QuickPickItem & { value: boolean };
        const validationChoice = await vscode.window.showQuickPick(
          [
            {
              label: this.safeTranslate("common.yes", "Yes"),
              value: true,
            },
            {
              label: this.safeTranslate("common.no", "No"),
              value: false,
            },
          ] satisfies BooleanQuickPickItem[],
          {
            placeHolder: this.safeTranslate(
              "init.prompt.commit_validation",
              "Enable commit validation hooks?",
            ),
          },
        );

        if (!validationChoice) {
          return;
        }

        commitValidation = validationChoice.value;
      }

      const workspaceFolder = this.getCurrentWorkspaceFolder();
      let projectPath: string;

      if (workspaceFolder) {
        projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
      } else {
        const folderUris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: t("vscode.init.select_project_location"),
        });

        if (!folderUris || folderUris.length === 0) {
          return;
        }

        projectPath = path.join(folderUris[0].fsPath, projectName);
      }

      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(projectPath));
        const overwrite = await this.confirmAction(
          t("vscode.init.directory_exists_overwrite", { projectName }),
          t("vscode.init.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch (error) {
        console.warn("Directory check failed:", error);
      }

      const workflowOptions: InitWorkflowOptions = {
        projectPath,
        projectName,
        description,
        authorName,
        stack: stack.label as InitWorkflowOptions["stack"],
        features,
        commitValidation,
      };

      const initializingTitle = this.safeTranslate(
        "vscode.init.initializing_project",
        `Initializing project ${projectName}`,
        { projectName },
      );

      const workflowResult = await vscode.window.withProgress<
        InitWorkflowResult | undefined
      >(
        {
          location: vscode.ProgressLocation.Notification,
          title: initializingTitle,
          cancellable: false,
        },
        async (
          progress: vscode.Progress<{ message?: string; increment?: number }>,
        ) => {
          progress.report({
            message: this.safeTranslate(
              "vscode.init.setting_up_structure",
              "Setting up project structure...",
            ),
          });

          const hooks = this.createWorkflowHooks(progress);
          return runInitWorkflow(workflowOptions, hooks);
        },
      );

      if (!workflowResult) {
        return;
      }

      if (workflowResult.status === "cancelled") {
        await vscode.window.showWarningMessage(
          this.safeTranslate(
            "common.operation_cancelled",
            "Operation cancelled.",
          ),
        );
        return;
      }

      if (
        !workflowResult.dependenciesInstalled &&
        workflowResult.installCommand
      ) {
        const installCommandString =
          `${workflowResult.installCommand.command} ${workflowResult.installCommand.args.join(" ")}`.trim();
        const lastWarning =
          workflowResult.warnings.at(-1) ??
          this.safeTranslate(
            "init.error.deps_install_unknown",
            "Unknown error",
          );
        const failureMessage = this.safeTranslate(
          "init.error.deps_install_failed",
          `Failed to install dependencies: ${lastWarning}`,
          { error: lastWarning },
        );
        const manualMessage = this.safeTranslate(
          "init.error.deps_install_manual",
          "Please run the install command manually:",
        );
        await vscode.window.showWarningMessage(
          `${failureMessage}\n${manualMessage}\n${installCommandString}`,
        );
      }

      const openProjectLabel = this.safeTranslate(
        "vscode.init.open_project",
        "Open Project",
      );
      const laterLabel = this.safeTranslate("vscode.init.later", "Later");
      const successMessage = this.safeTranslate(
        "vscode.init.project_created_successfully",
        `Project ${projectName} created successfully!`,
        { projectName },
      );

      const openProject = await vscode.window.showInformationMessage(
        successMessage,
        openProjectLabel,
        laterLabel,
      );

      if (openProject === openProjectLabel) {
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, true);
      }
    } catch (error) {
      this.showError(
        t("vscode.init.failed_initialize_project", { error: String(error) }),
      );
    }
  }

  /**
   * Creates workflow hooks wired to VS Code progress feedback and dialogs.
   * @param progress - The VS Code progress reporter.
   * @returns Configured hooks for the init workflow.
   */
  private createWorkflowHooks(
    progress: vscode.Progress<{ message?: string; increment?: number }>,
  ): InitWorkflowHooks {
    const stepMessage = (step: InitWorkflowStep): string | undefined => {
      switch (step) {
        case "scaffold":
          return this.safeTranslate(
            "init.step.scaffold",
            "Scaffolding project...",
          );
        case "saveConfig":
          return this.safeTranslate(
            "vscode.init.step.save_config",
            "Saving StackCode configuration...",
          );
        case "generateReadme":
          return this.safeTranslate(
            "init.step.readme",
            "Generating README.md...",
          );
        case "generateGitignore":
          return this.safeTranslate(
            "init.step.gitignore",
            "Creating .gitignore...",
          );
        case "setupHusky":
          return this.safeTranslate(
            "init.step.husky",
            "Configuring Husky hooks...",
          );
        case "initializeGit":
          return this.safeTranslate(
            "init.step.git",
            "Initializing Git repository...",
          );
        case "validateDependencies":
          return this.safeTranslate(
            "init.step.validate_deps",
            "Validating local dependencies...",
          );
        case "installDependencies":
          return this.safeTranslate(
            "init.step.deps",
            "Installing project dependencies...",
          );
        case "completed":
          return this.safeTranslate(
            "vscode.init.project_initialized_successfully",
            "Project initialized successfully!",
          );
        default:
          return undefined;
      }
    };

    return {
      onProgress: async ({ step }: InitWorkflowProgress) => {
        const message = stepMessage(step);
        if (message) {
          progress.report({ message });
        }
      },
      onEducationalMessage: async (messageKey: string) => {
        const message = this.safeTranslate(messageKey, messageKey);
        progress.report({ message });
      },
      onMissingDependencies: async (
        details: InitWorkflowDependencyDecision,
      ) => {
        await vscode.window.showWarningMessage(
          this.formatMissingDependenciesMessage(details),
        );
      },
      confirmContinueAfterMissingDependencies: async () => {
        const continueLabel = this.safeTranslate("common.continue", "Continue");
        const cancelLabel = this.safeTranslate("common.cancel", "Cancel");
        const choice = await vscode.window.showWarningMessage(
          this.safeTranslate(
            "init.dependencies.prompt_continue",
            "Continue even if some dependencies are missing?",
          ),
          { modal: true },
          continueLabel,
          cancelLabel,
        );
        return choice === continueLabel;
      },
    };
  }

  /**
   * Formats a readable warning message listing missing dependencies.
   * @param details - The dependency validation outcome.
   * @returns Formatted multi-line warning string.
   */
  private formatMissingDependenciesMessage(
    details: InitWorkflowDependencyDecision,
  ): string {
    const header = this.safeTranslate(
      "init.dependencies.missing",
      `Missing dependencies for ${details.stack}`,
      { stack: details.stack },
    );
    const missingLines = details.missingDependencies.map((dependency: string) =>
      this.safeTranslate(
        "init.dependencies.missing_detail",
        `  - ${dependency}`,
        { command: dependency },
      ),
    );
    const instructionHeader = this.safeTranslate(
      "init.dependencies.install_instructions",
      "Install the following dependencies:",
    );
    const installLines = details.missingDependencies.map((dependency: string) =>
      this.safeTranslate(
        `init.dependencies.install_${dependency}`,
        `  - ${dependency}`,
      ),
    );
    const optionalWarning = this.safeTranslate(
      "init.dependencies.optional_skip",
      "You can skip for now, but remember to install them later.",
    );

    return [
      header,
      ...missingLines,
      "",
      instructionHeader,
      ...installLines,
      "",
      optionalWarning,
    ]
      .filter((line) => line.length > 0)
      .join("\n");
  }

  /**
   * Attempts to translate a key, falling back to a default string when missing.
   * @param key - Translation key to resolve.
   * @param fallback - Fallback string when key is missing.
   * @param variables - Optional translation variables.
   * @returns Resolved translation or fallback.
   */
  private safeTranslate(
    key: string,
    fallback: string,
    variables?: Record<string, string | number>,
  ): string {
    try {
      return variables ? t(key, variables) : t(key);
    } catch {
      return fallback;
    }
  }

  private async getGitUserName(): Promise<string> {
    try {
      const terminal = vscode.window.createTerminal({ name: "temp" });
      terminal.sendText("git config user.name");
      terminal.dispose();
      return "";
    } catch {
      return "";
    }
  }
}
