/**
 * @file Integration tests for CommitCommand
 *
 * Tests the interaction between CommitCommand and the @stackcode/core commit workflow,
 * ensuring proper VSCode UI integration, user input handling, and error scenarios.
 */

import * as vscode from "vscode";
import { CommitCommand } from "../../commands/CommitCommand";
import { GitHubAuthService } from "../../services/GitHubAuthService";
import { GitMonitor } from "../../monitors/GitMonitor";
import { ProgressManager } from "../../services/ProgressManager";
import { runCommitWorkflow } from "@stackcode/core";

jest.mock("vscode", () => {
  const mockQuickPick = {
    show: jest.fn(),
    hide: jest.fn(),
    onDidChangeSelection: jest.fn(),
    onDidHide: jest.fn(),
    dispose: jest.fn(),
  };

  return {
    window: {
      showQuickPick: jest.fn(),
      showInputBox: jest.fn(),
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      withProgress: jest.fn((_, callback) => callback({ report: jest.fn() })),
      createQuickPick: jest.fn(() => mockQuickPick),
    },
    workspace: {
      workspaceFolders: [
        {
          uri: { fsPath: "/test/workspace" },
          name: "test",
          index: 0,
        },
      ],
      getConfiguration: jest.fn(() => ({
        get: jest.fn(),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn(),
      })),
    },
    ProgressLocation: {
      Notification: 15,
    },
    Uri: {
      file: jest.fn((path) => ({ fsPath: path })),
    },
  };
});

jest.mock("@stackcode/core", () => ({
  runCommitWorkflow: jest.fn(),
}));

jest.mock("@stackcode/i18n", () => ({
  t: jest.fn((key) => key),
}));

describe("CommitCommand Integration Tests", () => {
  let commitCommand: CommitCommand;
  let mockAuthService: jest.Mocked<GitHubAuthService>;
  let mockGitMonitor: jest.Mocked<GitMonitor>;
  let mockProgressManager: jest.Mocked<ProgressManager>;
  const mockExtensionContext = {
    subscriptions: [],
    workspaceState: { get: jest.fn(), update: jest.fn() },
    globalState: { get: jest.fn(), update: jest.fn() },
    secrets: { get: jest.fn(), store: jest.fn(), delete: jest.fn() },
  } as unknown as vscode.ExtensionContext;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockResolvedValue(true) as any,
      getAuthToken: jest.fn().mockResolvedValue("mock-token"),
      authenticate: jest.fn().mockResolvedValue(true),
    } as any;

    mockGitMonitor = {
      getCurrentGitHubRepository: jest.fn().mockResolvedValue(null),
      refresh: jest.fn(),
    } as any;

    mockProgressManager = {
      startWorkflow: jest.fn(),
      reportProgress: jest.fn(),
      completeWorkflow: jest.fn(),
      failWorkflow: jest.fn(),
      setVSCodeProgressReporter: jest.fn(),
      clearVSCodeProgressReporter: jest.fn(),
    } as any;

    commitCommand = new CommitCommand(
      mockAuthService,
      mockGitMonitor,
      mockProgressManager,
      mockExtensionContext,
    );

    (vscode.window.showQuickPick as jest.Mock).mockClear();
    (vscode.window.showInputBox as jest.Mock).mockClear();
    (vscode.window.showInformationMessage as jest.Mock).mockClear();
    (vscode.window.showErrorMessage as jest.Mock).mockClear();
    (runCommitWorkflow as jest.Mock).mockClear();
  });

  describe("execute()", () => {
    it("should execute commit workflow successfully", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feat",
        value: "feat",
      });
      (vscode.window.showInputBox as jest.Mock)
        .mockResolvedValueOnce("") // scope
        .mockResolvedValueOnce("Add new feature") // short description
        .mockResolvedValueOnce("") // long description
        .mockResolvedValueOnce("") // breaking changes
        .mockResolvedValueOnce(""); // issue references

      // Mock workflow

      (runCommitWorkflow as jest.Mock).mockResolvedValue({
        status: "committed",
        message: "feat: Add new feature",
      } as any);

      // Execute command
      await commitCommand.execute();

      // Verify workflow was called
      expect(runCommitWorkflow as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "feat",
          shortDescription: "Add new feature",
          cwd: "/test/workspace",
        }),
        expect.objectContaining({
          onProgress: expect.any(Function),
        }),
      );

      // Verify progress tracking
      expect(mockProgressManager.startWorkflow).toHaveBeenCalledWith("commit");
      expect(mockProgressManager.completeWorkflow).toHaveBeenCalled();
    });

    it("should handle missing workspace folder", async () => {
      // Mock no workspace
      // Save original
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      // Save original
      (vscode.workspace as any).workspaceFolders = undefined;

      const showErrorSpy = jest.spyOn(vscode.window, "showErrorMessage");

      await commitCommand.execute();

      expect(showErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("no_workspace_folder"),
      );
      expect(runCommitWorkflow).not.toHaveBeenCalled();
      // Restore
      (vscode.workspace as any).workspaceFolders = originalWorkspaceFolders;
    });

    it("should handle user cancellation at commit type selection", async () => {
      // Mock user cancels
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await commitCommand.execute();

      expect(runCommitWorkflow).not.toHaveBeenCalled();
    });

    it("should handle workflow errors gracefully", async () => {
      // Mock user inputs
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feat",
        value: "feat",
      });
      (vscode.window.showInputBox as jest.Mock)
        .mockResolvedValueOnce("") // scope
        .mockResolvedValueOnce("Add feature") // short description
        .mockResolvedValueOnce("") // long description
        .mockResolvedValueOnce("") // breaking changes
        .mockResolvedValueOnce(""); // issue references

      // Mock workflow error
      const mockError = new Error("Git commit failed");

      (runCommitWorkflow as jest.Mock).mockRejectedValue(mockError);

      await commitCommand.execute();

      // Verify error handling
      // When workflow throws, it's caught in catch block
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("should handle breaking changes flag", async () => {
      // Mock user inputs with breaking changes
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feat",
        value: "feat",
      });
      (vscode.window.showInputBox as jest.Mock)
        .mockResolvedValueOnce("api") // scope
        .mockResolvedValueOnce("Change API response format") // short description
        .mockResolvedValueOnce("Details about the change") // long description
        .mockResolvedValueOnce("API response structure changed"); // breaking changes

      (runCommitWorkflow as jest.Mock).mockResolvedValue({
        status: "committed",
        message: "feat(api)!: Change API response format",
      } as any);

      await commitCommand.execute();

      expect(runCommitWorkflow as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "feat",
          scope: "api",
          shortDescription: "Change API response format",
          cwd: "/test/workspace",
          breakingChanges: "API response structure changed",
        }),
        expect.any(Object),
      );
    });
  });

  describe("Progress Tracking", () => {
    it("should track workflow progress through ProgressManager", async () => {
      // Mock user inputs
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feat",
        value: "feat",
      });
      (vscode.window.showInputBox as jest.Mock)
        .mockResolvedValueOnce("") // scope
        .mockResolvedValueOnce("Add feature") // short description
        .mockResolvedValueOnce("") // long description
        .mockResolvedValueOnce("") // breaking changes
        .mockResolvedValueOnce(""); // issue references

      (runCommitWorkflow as jest.Mock).mockResolvedValue({
        status: "committed",
        message: "feat: Add feature",
      } as any);

      await commitCommand.execute();

      // Verify progress manager methods were called
      expect(mockProgressManager.startWorkflow).toHaveBeenCalledWith("commit");
      expect(mockProgressManager.setVSCodeProgressReporter).toHaveBeenCalled();
      expect(
        mockProgressManager.clearVSCodeProgressReporter,
      ).toHaveBeenCalled();
    });
  });
});
