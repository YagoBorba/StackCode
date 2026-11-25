import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";
import * as path from "path";
import {
  runGenerateWorkflow,
  type GenerateFileType,
  type GenerateWorkflowHooks,
  type GenerateWorkflowOptions,
  type GenerateWorkflowResult,
  type GenerateWorkflowStep,
} from "@stackcode/core";

/**
 * Command to generate project files like README.md and .gitignore.
 * Provides options to generate individual files or both at once.
 */
export class GenerateCommand extends BaseCommand {
  /**
   * Executes the file generation workflow with user selection.
   */
  async execute(): Promise<void> {
    const option = await vscode.window.showQuickPick(
      [
        {
          label: "README.md",
          description: t("vscode.generate.readme_description"),
        },
        {
          label: ".gitignore",
          description: t("vscode.generate.gitignore_description"),
        },
        {
          label: t("vscode.generate.both"),
          description: t("vscode.generate.both_description"),
        },
      ],
      {
        placeHolder: t("vscode.generate.what_would_you_like_generate"),
      },
    );

    if (!option) {
      return;
    }

    if (option.label === "README.md") {
      await this.generateReadme();
    } else if (option.label === ".gitignore") {
      await this.generateGitignore();
    } else if (option.label === t("vscode.generate.both")) {
      await this.generateReadme();
      await this.generateGitignore();
    }
  }

  private async ensureWorkspaceFolder(): Promise<
    vscode.WorkspaceFolder | undefined
  > {
    const workspaceFolder = this.getCurrentWorkspaceFolder();
    if (!workspaceFolder) {
      await this.showError(t("vscode.common.no_workspace_folder"));
      return undefined;
    }
    return workspaceFolder;
  }

  private async promptGitignoreTechnologies(): Promise<string[] | undefined> {
    const selections = await vscode.window.showQuickPick(
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
        placeHolder: t("vscode.generate.select_project_type_gitignore"),
        canPickMany: true,
      },
    );
    if (!selections || selections.length === 0) return undefined;
    return selections.map((s) => s.label);
  }

  private stepMessage(step: GenerateWorkflowStep): string | undefined {
    switch (step) {
      case "checkingFile":
        return t("vscode.generate.setting_up_readme");
      case "generatingContent":
        return t("vscode.generate.running_generator");
      case "writingFile":
        return t("vscode.generate.readme_created");
      default:
        return undefined;
    }
  }

  private createWorkflowHooks(
    progress: vscode.Progress<{ message?: string }>,
  ): GenerateWorkflowHooks {
    return {
      onProgress: async ({ step }: { step: GenerateWorkflowStep }) => {
        const message = this.stepMessage(step);
        if (message) progress.report({ message });
      },
      onEducationalMessage: async (messageKey: string) => {
        progress.report({ message: t(messageKey) });
      },
      shouldOverwriteFile: async ({
        fileType,
      }: {
        fileType: GenerateFileType;
        filePath: string;
      }) => {
        const confirmLabel = t("vscode.generate.overwrite");
        const message =
          fileType === "readme"
            ? t("vscode.generate.readme_exists_overwrite")
            : t("vscode.generate.gitignore_exists_overwrite");
        const choice = await vscode.window.showWarningMessage(
          message,
          { modal: true },
          confirmLabel,
        );
        return choice === confirmLabel;
      },
    };
  }

  private async runWorkflowWithProgress(
    workspaceFolder: vscode.WorkspaceFolder,
    options: GenerateWorkflowOptions,
  ): Promise<GenerateWorkflowResult> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: t("vscode.generate.running_generator"),
        cancellable: false,
      },
      async (progress) => {
        const hooks = this.createWorkflowHooks(progress);
        return runGenerateWorkflow(options, hooks);
      },
    );
  }

  private async handleWorkflowOutcome(
    workspaceFolder: vscode.WorkspaceFolder,
    result: GenerateWorkflowResult,
    fileTypes: GenerateFileType[],
  ): Promise<void> {
    const created = result.files.filter(
      (f: GenerateWorkflowResult["files"][number]) =>
        f.status === "created" || f.status === "overwritten",
    );
    for (const f of created) {
      if (f.fileType === "readme") {
        await this.showSuccess(t("vscode.generate.readme_has_been_generated"));
      } else if (f.fileType === "gitignore") {
        await this.showSuccess(
          t("vscode.generate.gitignore_has_been_generated"),
        );
      }
    }

    for (const ft of fileTypes) {
      const filePath = path.join(
        workspaceFolder.uri.fsPath,
        ft === "readme" ? "README.md" : ".gitignore",
      );
      const openPromptKey =
        ft === "readme"
          ? "vscode.generate.would_you_like_open_readme"
          : "vscode.generate.would_you_like_open_gitignore";
      const openLabel = t("vscode.generate.open_file");
      const choice = await vscode.window.showInformationMessage(
        t(openPromptKey),
        openLabel,
      );
      if (choice === openLabel) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
      }
    }

    if (result.warnings.length > 0) {
      for (const w of result.warnings) {
        await this.showWarning(t(w));
      }
    }
  }
  async generateReadme(): Promise<void> {
    const workspaceFolder = await this.ensureWorkspaceFolder();
    if (!workspaceFolder) {
      return;
    }

    try {
      const result = await this.runWorkflowWithProgress(workspaceFolder, {
        projectPath: workspaceFolder.uri.fsPath,
        files: ["readme"],
      });

      await this.handleWorkflowOutcome(workspaceFolder, result, ["readme"]);
    } catch (error) {
      await this.showError(
        t("vscode.generate.failed_generate_readme", { error: String(error) }),
      );
    }
  }

  async generateGitignore(): Promise<void> {
    const workspaceFolder = await this.ensureWorkspaceFolder();
    if (!workspaceFolder) {
      return;
    }

    const technologies = await this.promptGitignoreTechnologies();
    if (!technologies) {
      return;
    }

    try {
      const result = await this.runWorkflowWithProgress(workspaceFolder, {
        projectPath: workspaceFolder.uri.fsPath,
        files: ["gitignore"],
        gitignoreTechnologies: technologies,
      });

      await this.handleWorkflowOutcome(workspaceFolder, result, ["gitignore"]);
    } catch (error) {
      await this.showError(
        t("vscode.generate.failed_generate_gitignore", {
          error: String(error),
        }),
      );
    }
  }

  private async generateFiles(
    fileTypes: GenerateFileType[],
    gitignoreTechnologies?: string[],
  ): Promise<void> {
    const workspaceFolder = await this.ensureWorkspaceFolder();
    if (!workspaceFolder) {
      return;
    }

    try {
      const result = await this.runWorkflowWithProgress(workspaceFolder, {
        projectPath: workspaceFolder.uri.fsPath,
        files: fileTypes,
        gitignoreTechnologies,
      });

      await this.handleWorkflowOutcome(workspaceFolder, result, fileTypes);
    } catch (error) {
      await this.showError(
        t("vscode.generate.failed_generate_readme", { error: String(error) }),
      );
    }
  }
}
