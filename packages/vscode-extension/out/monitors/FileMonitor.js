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
exports.FileMonitor = void 0;
const vscode = __importStar(require("vscode"));
const i18n_1 = require("@stackcode/i18n");
class FileMonitor {
    constructor(proactiveManager, configManager) {
        this.disposables = [];
        this.processedFiles = new Set();
        this.proactiveManager = proactiveManager;
        this.configManager = configManager;
    }
    startMonitoring() {
        // Monitor file creation
        this.disposables.push(vscode.workspace.onDidCreateFiles((event) => {
            for (const file of event.files) {
                this.handleFileCreation(file);
            }
        }));
        // Monitor file changes
        this.disposables.push(vscode.workspace.onDidChangeTextDocument((event) => {
            this.handleFileChange(event);
        }));
        // Monitor when files are opened
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.handleFileOpen(editor.document.uri);
            }
        }));
    }
    async handleFileCreation(fileUri) {
        if (!this.configManager.notificationsEnabled) {
            return;
        }
        const fileName = fileUri.path.split("/").pop() || "";
        const fileKey = `${fileUri.toString()}-created`;
        if (this.processedFiles.has(fileKey)) {
            return;
        }
        this.processedFiles.add(fileKey);
        // Suggest generating comprehensive files
        if (["README.md", ".gitignore"].includes(fileName)) {
            await this.proactiveManager.showFileCreationSuggestion(fileName);
        }
    }
    async handleFileChange(event) {
        const document = event.document;
        // Skip if not a git commit message
        if (!document.fileName.includes("COMMIT_EDITMSG")) {
            return;
        }
        const content = document.getText();
        if (content.trim()) {
            await this.proactiveManager.showCommitMessageWarning(content);
        }
    }
    async handleFileOpen(fileUri) {
        const fileName = fileUri.path.split("/").pop() || "";
        const fileKey = `${fileUri.toString()}-opened`;
        if (this.processedFiles.has(fileKey)) {
            return;
        }
        this.processedFiles.add(fileKey);
        // Check for missing important files when opening project files
        if (fileName.endsWith(".js") ||
            fileName.endsWith(".ts") ||
            fileName.endsWith(".json")) {
            await this.checkProjectStructure();
        }
    }
    async checkProjectStructure() {
        if (!this.configManager.notificationsEnabled) {
            return;
        }
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }
        try {
            const files = await vscode.workspace.fs.readDirectory(workspaceFolder.uri);
            const fileNames = files.map(([name]) => name);
            const missingFiles = [];
            if (!fileNames.includes("README.md")) {
                missingFiles.push("README.md");
            }
            if (!fileNames.includes(".gitignore")) {
                missingFiles.push(".gitignore");
            }
            if (missingFiles.length > 0 && Math.random() < 0.3) {
                // Show suggestion 30% of the time
                const message = (0, i18n_1.t)("vscode.common.project_missing_files", { missingFiles: missingFiles.join(", ") });
                const action = await vscode.window.showInformationMessage(message, (0, i18n_1.t)("vscode.common.generate_files"), (0, i18n_1.t)("vscode.common.not_now"), (0, i18n_1.t)("vscode.common.dont_show_again"));
                if (action === (0, i18n_1.t)("vscode.common.generate_files")) {
                    // TODO: Implement file generation
                    vscode.window.showInformationMessage((0, i18n_1.t)("vscode.common.file_generation_available_soon"));
                }
                else if (action === (0, i18n_1.t)("vscode.common.dont_show_again")) {
                    await this.configManager.updateConfiguration("notifications.enabled", false);
                }
            }
        }
        catch (error) {
            // Use proper VS Code logging instead of console.log
            const outputChannel = vscode.window.createOutputChannel("StackCode");
            outputChannel.appendLine((0, i18n_1.t)("vscode.common.error_checking_project_structure", { error: String(error) }));
        }
    }
    dispose() {
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.processedFiles.clear();
    }
}
exports.FileMonitor = FileMonitor;
//# sourceMappingURL=FileMonitor.js.map