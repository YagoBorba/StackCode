import * as vscode from "vscode";
import { ProactiveNotificationManager } from "../notifications/ProactiveNotificationManager";
import { ConfigurationManager } from "../config/ConfigurationManager";
import { t } from "@stackcode/i18n";

export class FileMonitor implements vscode.Disposable {
  private proactiveManager: ProactiveNotificationManager;
  private configManager: ConfigurationManager;
  private disposables: vscode.Disposable[] = [];
  private processedFiles: Set<string> = new Set();

  constructor(
    proactiveManager: ProactiveNotificationManager,
    configManager: ConfigurationManager,
  ) {
    this.proactiveManager = proactiveManager;
    this.configManager = configManager;
  }

  startMonitoring(): void {
    // Monitor file creation
    this.disposables.push(
      vscode.workspace.onDidCreateFiles((event: vscode.FileCreateEvent) => {
        for (const file of event.files) {
          this.handleFileCreation(file);
        }
      }),
    );

    // Monitor file changes
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(
        (event: vscode.TextDocumentChangeEvent) => {
          this.handleFileChange(event);
        },
      ),
    );

    // Monitor when files are opened
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(
        (editor: vscode.TextEditor | undefined) => {
          if (editor) {
            this.handleFileOpen(editor.document.uri);
          }
        },
      ),
    );
  }

  private async handleFileCreation(fileUri: vscode.Uri): Promise<void> {
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

  private async handleFileChange(
    event: vscode.TextDocumentChangeEvent,
  ): Promise<void> {
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

  private async handleFileOpen(fileUri: vscode.Uri): Promise<void> {
    const fileName = fileUri.path.split("/").pop() || "";
    const fileKey = `${fileUri.toString()}-opened`;

    if (this.processedFiles.has(fileKey)) {
      return;
    }

    this.processedFiles.add(fileKey);

    // Check for missing important files when opening project files
    if (
      fileName.endsWith(".js") ||
      fileName.endsWith(".ts") ||
      fileName.endsWith(".json")
    ) {
      await this.checkProjectStructure();
    }
  }

  private async checkProjectStructure(): Promise<void> {
    if (!this.configManager.notificationsEnabled) {
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    try {
      const files = await vscode.workspace.fs.readDirectory(
        workspaceFolder.uri,
      );
      const fileNames = files.map(([name]: [string, vscode.FileType]) => name);

      const missingFiles: string[] = [];

      if (!fileNames.includes("README.md")) {
        missingFiles.push("README.md");
      }

      if (!fileNames.includes(".gitignore")) {
        missingFiles.push(".gitignore");
      }

      if (missingFiles.length > 0 && Math.random() < 0.3) {
        // Show suggestion 30% of the time
        const message = t("vscode.common.project_missing_files", { missingFiles: missingFiles.join(", ") });

        const action = await vscode.window.showInformationMessage(
          message,
          t("vscode.common.generate_files"),
          t("vscode.common.not_now"),
          t("vscode.common.dont_show_again"),
        );

        if (action === t("vscode.common.generate_files")) {
          // TODO: Implement file generation
          vscode.window.showInformationMessage(
            t("vscode.common.file_generation_available_soon"),
          );
        } else if (action === t("vscode.common.dont_show_again")) {
          await this.configManager.updateConfiguration(
            "notifications.enabled",
            false,
          );
        }
      }
    } catch (error: any) {
      // Use proper VS Code logging instead of console.log
      const outputChannel = vscode.window.createOutputChannel("StackCode");
      outputChannel.appendLine(t("vscode.common.error_checking_project_structure", { error: String(error) }));
    }
  }

  dispose(): void {
    this.disposables.forEach((d: vscode.Disposable) => d.dispose());
    this.disposables = [];
    this.processedFiles.clear();
  }
}
