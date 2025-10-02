"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
const core_1 = require("@stackcode/core");
class ConfigCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            const action = await vscode.window.showQuickPick([
                {
                    label: (0, i18n_1.t)("vscode.config.open_stackcode_settings"),
                    description: (0, i18n_1.t)("vscode.config.open_stackcode_settings_description"),
                },
                {
                    label: (0, i18n_1.t)("vscode.config.open_project_config"),
                    description: (0, i18n_1.t)("vscode.config.open_project_config_description"),
                },
                {
                    label: (0, i18n_1.t)("vscode.config.create_project_config"),
                    description: (0, i18n_1.t)("vscode.config.create_project_config_description"),
                },
            ], {
                placeHolder: (0, i18n_1.t)("vscode.config.what_would_you_like_configure"),
            });
            if (!action) {
                return;
            }
            if (action.label === (0, i18n_1.t)("vscode.config.open_stackcode_settings")) {
                vscode.commands.executeCommand("workbench.action.openSettings", "stackcode");
            }
            else if (action.label === (0, i18n_1.t)("vscode.config.open_project_config")) {
                const configPath = vscode.Uri.joinPath(workspaceFolder.uri, ".stackcoderc.json");
                try {
                    const document = await vscode.workspace.openTextDocument(configPath);
                    await vscode.window.showTextDocument(document);
                }
                catch {
                    this.showError((0, i18n_1.t)("vscode.config.stackcoderc_not_found"));
                }
            }
            else if (action.label === (0, i18n_1.t)("vscode.config.create_project_config")) {
                await this.createProjectConfig(workspaceFolder);
            }
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.config.failed_open_configuration", { error: String(error) }));
        }
    }
    async createProjectConfig(workspaceFolder) {
        try {
            const configUri = vscode.Uri.joinPath(workspaceFolder.uri, ".stackcoderc.json");
            try {
                await vscode.workspace.fs.stat(configUri);
                const overwrite = await this.confirmAction((0, i18n_1.t)("vscode.config.stackcoderc_exists_overwrite"), (0, i18n_1.t)("vscode.config.overwrite"), (0, i18n_1.t)("common.cancel"));
                if (!overwrite) {
                    return;
                }
            }
            catch {
                // File does not exist yet - continue without prompt
            }
            const defaultConfig = {
                stack: undefined,
                features: {
                    commitValidation: false,
                    husky: false,
                    docker: false,
                },
            };
            await (0, core_1.saveStackCodeConfig)(workspaceFolder.uri.fsPath, defaultConfig);
            const document = await vscode.workspace.openTextDocument(configUri);
            await vscode.window.showTextDocument(document);
            await this.showSuccess((0, i18n_1.t)("vscode.config.project_configuration_initialized"));
        }
        catch (error) {
            await this.showError((0, i18n_1.t)("vscode.config.failed_create_config", { error: String(error) }));
        }
    }
}
exports.ConfigCommand = ConfigCommand;
//# sourceMappingURL=ConfigCommand.js.map