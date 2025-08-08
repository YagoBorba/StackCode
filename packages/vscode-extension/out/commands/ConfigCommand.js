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
exports.ConfigCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
class ConfigCommand extends BaseCommand_1.BaseCommand {
  async execute() {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }
      const action = await vscode.window.showQuickPick(
        [
          {
            label: "Open StackCode Settings",
            description: "Configure StackCode extension settings",
          },
          {
            label: "Open Project Config",
            description: "Edit .stackcoderc.json file",
          },
          {
            label: "Create Project Config",
            description: "Create a new .stackcoderc.json file",
          },
        ],
        {
          placeHolder: "What would you like to configure?",
        },
      );
      if (!action) {
        return;
      }
      if (action.label === "Open StackCode Settings") {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "stackcode",
        );
      } else if (action.label === "Open Project Config") {
        const configPath = vscode.Uri.joinPath(
          workspaceFolder.uri,
          ".stackcoderc.json",
        );
        try {
          const document = await vscode.workspace.openTextDocument(configPath);
          await vscode.window.showTextDocument(document);
        } catch {
          this.showError(
            '.stackcoderc.json file not found. Use "Create Project Config" to create one.',
          );
        }
      } else if (action.label === "Create Project Config") {
        // Use StackCode CLI for config creation
        const command = `npx @stackcode/cli config init`;
        await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
        this.showSuccess("Project configuration initialized!");
      }
    } catch (error) {
      this.showError(`Failed to open configuration: ${error}`);
    }
  }
}
exports.ConfigCommand = ConfigCommand;
//# sourceMappingURL=ConfigCommand.js.map
