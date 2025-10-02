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
exports.TestGitHubDetectionCommand = void 0;
const vscode = __importStar(require("vscode"));
const GitMonitor_1 = require("../monitors/GitMonitor");
const ProactiveNotificationManager_1 = require("../notifications/ProactiveNotificationManager");
const ConfigurationManager_1 = require("../config/ConfigurationManager");
/**
 * Test command to verify GitHub repository detection
 */
class TestGitHubDetectionCommand {
    constructor() {
        const configManager = new ConfigurationManager_1.ConfigurationManager();
        const proactiveManager = new ProactiveNotificationManager_1.ProactiveNotificationManager(configManager);
        this.gitMonitor = new GitMonitor_1.GitMonitor(proactiveManager, configManager);
    }
    async execute() {
        try {
            console.log("🧪 [TestCommand] Starting GitHub repository detection test...");
            const repository = await this.gitMonitor.getCurrentGitHubRepository();
            if (repository) {
                const message = `✅ Repository Detected!\n\nOwner: ${repository.owner}\nRepo: ${repository.repo}\nFull Name: ${repository.fullName}\nRemote URL: ${repository.remoteUrl}`;
                vscode.window
                    .showInformationMessage(message, "Copy Full Name")
                    .then((selection) => {
                    if (selection === "Copy Full Name") {
                        vscode.env.clipboard.writeText(repository.fullName);
                        vscode.window.showInformationMessage(`Copied "${repository.fullName}" to clipboard!`);
                    }
                });
                console.log("✅ [TestCommand] Repository detection successful:", repository);
            }
            else {
                const message = "❌ No GitHub repository detected\n\nPossible causes:\n• Not in a Git repository\n• No GitHub remote configured\n• Remote is not a GitHub URL";
                vscode.window
                    .showWarningMessage(message, "Show Debug Info")
                    .then((selection) => {
                    if (selection === "Show Debug Info") {
                        const workspaceFolders = vscode.workspace.workspaceFolders;
                        const debugInfo = `Debug Info:\n\nWorkspace Folders: ${workspaceFolders?.length || 0}\nFolders: ${workspaceFolders?.map((f) => f.uri.fsPath).join(", ") || "None"}`;
                        vscode.window.showInformationMessage(debugInfo);
                    }
                });
                console.warn("❌ [TestCommand] Repository detection failed");
            }
        }
        catch (error) {
            const errorMessage = `❌ Error testing repository detection: ${error}`;
            vscode.window.showErrorMessage(errorMessage);
            console.error("❌ [TestCommand] Error:", error);
        }
    }
}
exports.TestGitHubDetectionCommand = TestGitHubDetectionCommand;
//# sourceMappingURL=TestGitHubDetectionCommand.js.map