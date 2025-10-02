/**
 * Integration tests for CommitCommand
 * Tests the interaction between the command and @stackcode/core workflows
 */

import * as vscode from "vscode";
import { CommitCommand } from "../../commands/CommitCommand";
import { GitHubAuthService } from "../../services/GitHubAuthService";
import { GitMonitor } from "../../monitors/GitMonitor";
import { ProgressManager } from "../../services/ProgressManager";
import * as core from "@stackcode/core";

// Mock VS Code API
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

// Mock @stackcode/core
jest.mock("@stackcode/core");

// Mock i18n
jest.mock("@stackcode/i18n", () => ({
  t: jest.fn((key) => key),
}));

describe("CommitCommand Integration Tests", () => {
  let commitCommand: CommitCommand;
  let mockAuthService: jest.Mocked<GitHubAuthService>;
  let mockGitMonitor: jest.Mocked<GitMonitor>;
  let mockProgressManager: jest.Mocked<ProgressManager>;

  beforeEach(() => {
    // Setup mocks
    mockAuthService = {
      isAuthenticated: jest.fn().mockResolvedValue(true) as any,
      getAuthToken: jest.fn().mockResolvedValue("mock-token"),
      authenticate: jest.fn().mockResolvedValue(true),
    } as any;

    mockGitMonitor = {
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
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("execute()", () => {
    it("should execute commit workflow with valid inputs", async () => {
      // Mock user inputs
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feat",
        value: "feat",
      });
      (vscode.window.showInputBox as jest.Mock)
        .mockResolvedValueOnce("") // scope
        .mockResolvedValueOnce("Add new feature") // short description
        .mockResolvedValueOnce("") // long description
        .mockResolvedValueOnce(""); // breaking changes

      // Mock workflow
      const mockRunCommitWorkflow = jest.spyOn(core, "runCommitWorkflow");
      mockRunCommitWorkflow.mockResolvedValue({
        status: "committed",
        message: "feat: Add new feature",
      } as any);

      // Execute command
      await commitCommand.execute();

      // Verify workflow was called
      expect(mockRunCommitWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "feat",
          message: "Add new feature",
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
      (vscode.workspace as any).workspaceFolders = undefined;

      const showErrorSpy = jest.spyOn(vscode.window, "showErrorMessage");

      await commitCommand.execute();

      expect(showErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("no_workspace_folder"),
      );
      expect(core.runCommitWorkflow).not.toHaveBeenCalled();
    });

    it("should handle user cancellation at commit type selection", async () => {
      // Mock user cancels
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await commitCommand.execute();

      expect(core.runCommitWorkflow).not.toHaveBeenCalled();
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
        .mockResolvedValueOnce(""); // breaking changes

      // Mock workflow error
      const mockError = new Error("Git commit failed");
      const mockRunCommitWorkflow = jest.spyOn(core, "runCommitWorkflow");
      mockRunCommitWorkflow.mockRejectedValue(mockError);

      await commitCommand.execute();

      // Verify error handling
      expect(mockProgressManager.failWorkflow).toHaveBeenCalledWith(
        "commit",
        expect.stringContaining("Git commit failed"),
      );
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

      const mockRunCommitWorkflow = jest.spyOn(core, "runCommitWorkflow");
      mockRunCommitWorkflow.mockResolvedValue({
        status: "committed",
        message: "feat(api)!: Change API response format",
      } as any);

      await commitCommand.execute();

      expect(mockRunCommitWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "feat",
          scope: "api",
          message: "Change API response format",
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
        .mockResolvedValueOnce(""); // breaking changes

      const mockRunCommitWorkflow = jest.spyOn(core, "runCommitWorkflow");
      mockRunCommitWorkflow.mockResolvedValue({
        status: "committed",
        message: "feat: Add feature",
      } as any);

      await commitCommand.execute();

      // Verify progress manager methods were called
      expect(mockProgressManager.startWorkflow).toHaveBeenCalledWith("commit");
      expect(mockProgressManager.setVSCodeProgressReporter).toHaveBeenCalled();
      expect(mockProgressManager.clearVSCodeProgressReporter).toHaveBeenCalled();
    });
  });
});
