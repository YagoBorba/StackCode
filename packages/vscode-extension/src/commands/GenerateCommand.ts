import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import { t } from "@stackcode/i18n";
import * as path from "path";

export class GenerateCommand extends BaseCommand {
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

  async generateReadme(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      const readmePath = path.join(workspaceFolder.uri.fsPath, "README.md");

      // Check if README already exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(readmePath));
        const overwrite = await this.confirmAction(
          t("vscode.generate.readme_exists_overwrite"),
          t("vscode.generate.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // File doesn't exist, which is fine
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.generate.generating_readme"),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.generate.setting_up_readme"),
          });

          // Use StackCode CLI for generation
          const command = `npx @stackcode/cli generate readme`;

          progress.report({
            increment: 50,
            message: t("vscode.generate.running_generator"),
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: t("vscode.generate.readme_created"),
          });
        },
      );

      this.showSuccess(t("vscode.generate.readme_has_been_generated"));

      // Ask if user wants to open the file
      const openFile = await vscode.window.showInformationMessage(
        t("vscode.generate.would_you_like_open_readme"),
        t("vscode.generate.open_file"),
      );

      if (openFile === t("vscode.generate.open_file")) {
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(
        t("vscode.generate.failed_generate_readme", { error: String(error) }),
      );
    }
  }

  async generateGitignore(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      const gitignorePath = path.join(workspaceFolder.uri.fsPath, ".gitignore");

      // Check if .gitignore already exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(gitignorePath));
        const overwrite = await this.confirmAction(
          t("vscode.generate.gitignore_exists_overwrite"),
          t("vscode.generate.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // File doesn't exist, which is fine
      }

      // Ask for project type
      const projectType = await vscode.window.showQuickPick(
        [
          { label: "node-ts", description: t("vscode.init.stacks.node_ts") },
          { label: "react", description: t("vscode.init.stacks.react") },
          { label: "vue", description: t("vscode.init.stacks.vue") },
          { label: "angular", description: t("vscode.init.stacks.angular") },
          { label: "python", description: t("vscode.init.stacks.python") },
          { label: "java", description: t("vscode.init.stacks.java") },
          { label: "go", description: t("vscode.init.stacks.go") },
          { label: "php", description: t("vscode.init.stacks.php") },
          {
            label: "flutter",
            description: t("vscode.generate.stacks.flutter"),
          },
          { label: "swift", description: t("vscode.generate.stacks.swift") },
          {
            label: "android",
            description: t("vscode.generate.stacks.android"),
          },
        ],
        {
          placeHolder: t("vscode.generate.select_project_type_gitignore"),
        },
      );

      if (!projectType) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.generate.generating_gitignore"),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.generate.setting_up_gitignore"),
          });

          // Use StackCode CLI for generation
          const command = `npx @stackcode/cli generate gitignore --type="${projectType.label}"`;

          progress.report({
            increment: 50,
            message: t("vscode.generate.running_generator"),
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: t("vscode.generate.gitignore_created"),
          });
        },
      );

      this.showSuccess(t("vscode.generate.gitignore_has_been_generated"));

      // Ask if user wants to open the file
      const openFile = await vscode.window.showInformationMessage(
        t("vscode.generate.would_you_like_open_gitignore"),
        t("vscode.generate.open_file"),
      );

      if (openFile === t("vscode.generate.open_file")) {
        const document = await vscode.workspace.openTextDocument(gitignorePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(
        t("vscode.generate.failed_generate_gitignore", {
          error: String(error),
        }),
      );
    }
  }
}
