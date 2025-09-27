"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
const path = __importStar(require("path"));
class GenerateCommand extends BaseCommand_1.BaseCommand {
  async execute() {
    const option = await vscode.window.showQuickPick(
      [
        {
          label: "README.md",
          description: (0, i18n_1.t)("vscode.generate.readme_description"),
        },
        {
          label: ".gitignore",
          description: (0, i18n_1.t)("vscode.generate.gitignore_description"),
        },
        {
          label: (0, i18n_1.t)("vscode.generate.both"),
          description: (0, i18n_1.t)("vscode.generate.both_description"),
        },
      ],
      {
        placeHolder: (0, i18n_1.t)(
          "vscode.generate.what_would_you_like_generate",
        ),
      },
    );
    if (!option) {
      return;
    }
    if (option.label === "README.md") {
      await this.generateReadme();
    } else if (option.label === ".gitignore") {
      await this.generateGitignore();
    } else if (option.label === (0, i18n_1.t)("vscode.generate.both")) {
      await this.generateReadme();
      await this.generateGitignore();
    }
  }
  async generateReadme() {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
        return;
      }
      const readmePath = path.join(workspaceFolder.uri.fsPath, "README.md");
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(readmePath));
        const overwrite = await this.confirmAction(
          (0, i18n_1.t)("vscode.generate.readme_exists_overwrite"),
          (0, i18n_1.t)("vscode.generate.overwrite"),
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
          title: (0, i18n_1.t)("vscode.generate.generating_readme"),
          cancellable: false,
        },
        async (progress) => {
          progress.report({
            increment: 0,
            message: (0, i18n_1.t)("vscode.generate.setting_up_readme"),
          });
          const command = `npx @stackcode/cli generate readme`;
          progress.report({
            increment: 50,
            message: (0, i18n_1.t)("vscode.generate.running_generator"),
          });
          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
          progress.report({
            increment: 100,
            message: (0, i18n_1.t)("vscode.generate.readme_created"),
          });
        },
      );
      this.showSuccess(
        (0, i18n_1.t)("vscode.generate.readme_has_been_generated"),
      );
      const openFile = await vscode.window.showInformationMessage(
        (0, i18n_1.t)("vscode.generate.would_you_like_open_readme"),
        (0, i18n_1.t)("vscode.generate.open_file"),
      );
      if (openFile === (0, i18n_1.t)("vscode.generate.open_file")) {
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(
        (0, i18n_1.t)("vscode.generate.failed_generate_readme", {
          error: String(error),
        }),
      );
    }
  }
  async generateGitignore() {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
        return;
      }
      const gitignorePath = path.join(workspaceFolder.uri.fsPath, ".gitignore");
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(gitignorePath));
        const overwrite = await this.confirmAction(
          (0, i18n_1.t)("vscode.generate.gitignore_exists_overwrite"),
          (0, i18n_1.t)("vscode.generate.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // File doesn't exist, which is fine
      }
      const projectType = await vscode.window.showQuickPick(
        [
          {
            label: "node-ts",
            description: (0, i18n_1.t)("vscode.init.stacks.node_ts"),
          },
          {
            label: "react",
            description: (0, i18n_1.t)("vscode.init.stacks.react"),
          },
          {
            label: "vue",
            description: (0, i18n_1.t)("vscode.init.stacks.vue"),
          },
          {
            label: "angular",
            description: (0, i18n_1.t)("vscode.init.stacks.angular"),
          },
          {
            label: "python",
            description: (0, i18n_1.t)("vscode.init.stacks.python"),
          },
          {
            label: "java",
            description: (0, i18n_1.t)("vscode.init.stacks.java"),
          },
          { label: "go", description: (0, i18n_1.t)("vscode.init.stacks.go") },
          {
            label: "php",
            description: (0, i18n_1.t)("vscode.init.stacks.php"),
          },
          {
            label: "flutter",
            description: (0, i18n_1.t)("vscode.generate.stacks.flutter"),
          },
          {
            label: "swift",
            description: (0, i18n_1.t)("vscode.generate.stacks.swift"),
          },
          {
            label: "android",
            description: (0, i18n_1.t)("vscode.generate.stacks.android"),
          },
        ],
        {
          placeHolder: (0, i18n_1.t)(
            "vscode.generate.select_project_type_gitignore",
          ),
        },
      );
      if (!projectType) {
        return;
      }
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: (0, i18n_1.t)("vscode.generate.generating_gitignore"),
          cancellable: false,
        },
        async (progress) => {
          progress.report({
            increment: 0,
            message: (0, i18n_1.t)("vscode.generate.setting_up_gitignore"),
          });
          const command = `npx @stackcode/cli generate gitignore --type="${projectType.label}"`;
          progress.report({
            increment: 50,
            message: (0, i18n_1.t)("vscode.generate.running_generator"),
          });
          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
          progress.report({
            increment: 100,
            message: (0, i18n_1.t)("vscode.generate.gitignore_created"),
          });
        },
      );
      this.showSuccess(
        (0, i18n_1.t)("vscode.generate.gitignore_has_been_generated"),
      );
      const openFile = await vscode.window.showInformationMessage(
        (0, i18n_1.t)("vscode.generate.would_you_like_open_gitignore"),
        (0, i18n_1.t)("vscode.generate.open_file"),
      );
      if (openFile === (0, i18n_1.t)("vscode.generate.open_file")) {
        const document = await vscode.workspace.openTextDocument(gitignorePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(
        (0, i18n_1.t)("vscode.generate.failed_generate_gitignore", {
          error: String(error),
        }),
      );
    }
  }
}
exports.GenerateCommand = GenerateCommand;
//# sourceMappingURL=GenerateCommand.js.map
