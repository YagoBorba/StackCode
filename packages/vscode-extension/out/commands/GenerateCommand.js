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
exports.GenerateCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
const path = __importStar(require("path"));
const core_1 = require("@stackcode/core");
/**
 * Command to generate project files like README.md and .gitignore.
 * Provides options to generate individual files or both at once.
 */
class GenerateCommand extends BaseCommand_1.BaseCommand {
    /**
     * Executes the file generation workflow with user selection.
     */
    async execute() {
        const option = await vscode.window.showQuickPick([
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
        ], {
            placeHolder: (0, i18n_1.t)("vscode.generate.what_would_you_like_generate"),
        });
        if (!option) {
            return;
        }
        if (option.label === "README.md") {
            await this.generateReadme();
        }
        else if (option.label === ".gitignore") {
            await this.generateGitignore();
        }
        else if (option.label === (0, i18n_1.t)("vscode.generate.both")) {
            await this.generateReadme();
            await this.generateGitignore();
        }
    }
    async ensureWorkspaceFolder() {
        const workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            await this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
            return undefined;
        }
        return workspaceFolder;
    }
    async promptGitignoreTechnologies() {
        const selections = await vscode.window.showQuickPick([
            { label: "node-ts", description: (0, i18n_1.t)("vscode.init.stacks.node_ts") },
            { label: "react", description: (0, i18n_1.t)("vscode.init.stacks.react") },
            { label: "vue", description: (0, i18n_1.t)("vscode.init.stacks.vue") },
            { label: "angular", description: (0, i18n_1.t)("vscode.init.stacks.angular") },
            { label: "python", description: (0, i18n_1.t)("vscode.init.stacks.python") },
            { label: "java", description: (0, i18n_1.t)("vscode.init.stacks.java") },
            { label: "go", description: (0, i18n_1.t)("vscode.init.stacks.go") },
            { label: "php", description: (0, i18n_1.t)("vscode.init.stacks.php") },
        ], {
            placeHolder: (0, i18n_1.t)("vscode.generate.select_project_type_gitignore"),
            canPickMany: true,
        });
        if (!selections || selections.length === 0)
            return undefined;
        return selections.map((s) => s.label);
    }
    stepMessage(step) {
        switch (step) {
            case "checkingFile":
                return (0, i18n_1.t)("vscode.generate.setting_up_readme");
            case "generatingContent":
                return (0, i18n_1.t)("vscode.generate.running_generator");
            case "writingFile":
                return (0, i18n_1.t)("vscode.generate.readme_created");
            default:
                return undefined;
        }
    }
    createWorkflowHooks(progress) {
        return {
            onProgress: async ({ step }) => {
                const message = this.stepMessage(step);
                if (message)
                    progress.report({ message });
            },
            onEducationalMessage: async (messageKey) => {
                progress.report({ message: (0, i18n_1.t)(messageKey) });
            },
            shouldOverwriteFile: async ({ fileType, filePath, }) => {
                const confirmLabel = (0, i18n_1.t)("vscode.generate.overwrite");
                const message = fileType === "readme"
                    ? (0, i18n_1.t)("vscode.generate.readme_exists_overwrite")
                    : (0, i18n_1.t)("vscode.generate.gitignore_exists_overwrite");
                const choice = await vscode.window.showWarningMessage(message, { modal: true }, confirmLabel);
                return choice === confirmLabel;
            },
        };
    }
    async runWorkflowWithProgress(workspaceFolder, options) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: (0, i18n_1.t)("vscode.generate.running_generator"),
            cancellable: false,
        }, async (progress) => {
            const hooks = this.createWorkflowHooks(progress);
            return (0, core_1.runGenerateWorkflow)(options, hooks);
        });
    }
    async handleWorkflowOutcome(workspaceFolder, result, fileTypes) {
        const created = result.files.filter((f) => f.status === "created" || f.status === "overwritten");
        for (const f of created) {
            if (f.fileType === "readme") {
                await this.showSuccess((0, i18n_1.t)("vscode.generate.readme_has_been_generated"));
            }
            else if (f.fileType === "gitignore") {
                await this.showSuccess((0, i18n_1.t)("vscode.generate.gitignore_has_been_generated"));
            }
        }
        // Offer to open files
        for (const ft of fileTypes) {
            const filePath = path.join(workspaceFolder.uri.fsPath, ft === "readme" ? "README.md" : ".gitignore");
            const openPromptKey = ft === "readme"
                ? "vscode.generate.would_you_like_open_readme"
                : "vscode.generate.would_you_like_open_gitignore";
            const openLabel = (0, i18n_1.t)("vscode.generate.open_file");
            const choice = await vscode.window.showInformationMessage((0, i18n_1.t)(openPromptKey), openLabel);
            if (choice === openLabel) {
                const document = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(document);
            }
        }
        // Show translated warnings if any
        if (result.warnings.length > 0) {
            for (const w of result.warnings) {
                await this.showWarning((0, i18n_1.t)(w));
            }
        }
    }
    async generateReadme() {
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
        }
        catch (error) {
            await this.showError((0, i18n_1.t)("vscode.generate.failed_generate_readme", { error: String(error) }));
        }
    }
    async generateGitignore() {
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
        }
        catch (error) {
            await this.showError((0, i18n_1.t)("vscode.generate.failed_generate_gitignore", {
                error: String(error),
            }));
        }
    }
    async generateFiles(fileTypes, gitignoreTechnologies) {
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
        }
        catch (error) {
            await this.showError((0, i18n_1.t)("vscode.generate.failed_generate_readme", { error: String(error) }));
        }
    }
}
exports.GenerateCommand = GenerateCommand;
//# sourceMappingURL=GenerateCommand.js.map