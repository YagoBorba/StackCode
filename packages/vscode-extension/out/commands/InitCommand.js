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
exports.InitCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
const path = __importStar(require("path"));
class InitCommand extends BaseCommand_1.BaseCommand {
  async execute() {
    try {
      const projectName = await vscode.window.showInputBox({
        prompt: (0, i18n_1.t)("vscode.init.enter_project_name"),
        placeHolder: (0, i18n_1.t)("vscode.init.my_awesome_project"),
        validateInput: (value) => {
          if (!value) {
            return (0, i18n_1.t)("vscode.init.project_name_required");
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return (0, i18n_1.t)("vscode.init.project_name_invalid");
          }
          return null;
        },
      });
      if (!projectName) {
        return;
      }
      const description = await vscode.window.showInputBox({
        prompt: (0, i18n_1.t)("vscode.init.enter_project_description"),
        placeHolder: (0, i18n_1.t)("vscode.init.brief_description"),
      });
      const authorName = await vscode.window.showInputBox({
        prompt: (0, i18n_1.t)("vscode.init.enter_author_name"),
        placeHolder: (0, i18n_1.t)("vscode.init.your_name"),
        value: await this.getGitUserName(),
      });
      const stack = await vscode.window.showQuickPick(
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
        ],
        {
          placeHolder: (0, i18n_1.t)("vscode.init.select_project_stack"),
        },
      );
      if (!stack) {
        return;
      }
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      let projectPath;
      if (workspaceFolder) {
        projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
      } else {
        const folderUris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: (0, i18n_1.t)("vscode.init.select_project_location"),
        });
        if (!folderUris || folderUris.length === 0) {
          return;
        }
        projectPath = path.join(folderUris[0].fsPath, projectName);
      }
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(projectPath));
        const overwrite = await this.confirmAction(
          (0, i18n_1.t)("vscode.init.directory_exists_overwrite", {
            projectName,
          }),
          (0, i18n_1.t)("vscode.init.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // Directory doesn't exist, which is fine
      }
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: (0, i18n_1.t)("vscode.init.initializing_project", {
            projectName,
          }),
          cancellable: false,
        },
        async (progress) => {
          progress.report({
            increment: 0,
            message: (0, i18n_1.t)("vscode.init.setting_up_structure"),
          });
          const command = `npx @stackcode/cli init --name="${projectName}" --description="${description}" --author="${authorName}" --stack="${stack.label}" --path="${projectPath}"`;
          progress.report({
            increment: 50,
            message: (0, i18n_1.t)("vscode.init.running_stackcode_cli"),
          });
          await this.runTerminalCommand(command);
          progress.report({
            increment: 100,
            message: (0, i18n_1.t)(
              "vscode.init.project_initialized_successfully",
            ),
          });
        },
      );
      const openProject = await vscode.window.showInformationMessage(
        (0, i18n_1.t)("vscode.init.project_created_successfully", {
          projectName,
        }),
        (0, i18n_1.t)("vscode.init.open_project"),
        (0, i18n_1.t)("vscode.init.later"),
      );
      if (openProject === (0, i18n_1.t)("vscode.init.open_project")) {
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, true);
      }
    } catch (error) {
      this.showError(
        (0, i18n_1.t)("vscode.init.failed_initialize_project", {
          error: String(error),
        }),
      );
    }
  }
  async getGitUserName() {
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
exports.InitCommand = InitCommand;
//# sourceMappingURL=InitCommand.js.map
