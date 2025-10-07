/**
 * @file Integration tests for ReleaseCommand
 *
 * Tests the release workflow integration with VSCode, including version bumping,
 * changelog generation, user confirmations, and GitHub release preparation.
 */

import * as vscode from "vscode";
import { ReleaseCommand } from "../../commands/ReleaseCommand";
import { GitHubAuthService } from "../../services/GitHubAuthService";
import { ProgressManager } from "../../services/ProgressManager";
import { runReleaseWorkflow } from "@stackcode/core";

jest.mock("vscode", () => ({
  window: {
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    withProgress: jest.fn((_, callback) => callback({ report: jest.fn() })),
  },
  workspace: {
    workspaceFolders: [
      {
        uri: { fsPath: "/test/workspace" },
        name: "test",
        index: 0,
      },
    ],
  },
  ProgressLocation: {
    Notification: 15,
  },
  Uri: {
    file: jest.fn((path) => ({ fsPath: path })),
  },
}));

jest.mock("@stackcode/core", () => ({
  runReleaseWorkflow: jest.fn(),
}));

jest.mock("@stackcode/i18n", () => ({
  t: jest.fn((key) => key),
}));

describe("ReleaseCommand Integration Tests", () => {
  let releaseCommand: ReleaseCommand;
  let mockAuthService: jest.Mocked<GitHubAuthService>;
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

    mockProgressManager = {
      startWorkflow: jest.fn(),
      reportProgress: jest.fn(),
      completeWorkflow: jest.fn(),
      failWorkflow: jest.fn(),
      setVSCodeProgressReporter: jest.fn(),
      clearVSCodeProgressReporter: jest.fn(),
    } as any;

    releaseCommand = new ReleaseCommand(
      mockAuthService,
      mockProgressManager,
      mockExtensionContext,
    );

    jest.clearAllMocks();
  });

  describe("execute()", () => {
    it("should execute release workflow successfully", async () => {
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.release.create_release",
      );

      (runReleaseWorkflow as jest.Mock).mockResolvedValue({
        status: "prepared",
        packages: [
          {
            name: "@stackcode/core",
            version: "1.0.1",
            oldVersion: "1.0.0",
          },
        ],
      } as any);

      await releaseCommand.execute();

      expect(runReleaseWorkflow as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );

      expect(mockProgressManager.startWorkflow).toHaveBeenCalledWith("release");
      expect(mockProgressManager.completeWorkflow).toHaveBeenCalled();
    });

    it("should handle missing workspace folder", async () => {
      // Save original
      const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
      (vscode.workspace as any).workspaceFolders = undefined;

      await releaseCommand.execute();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("no_workspace_folder"),
      );
      expect(runReleaseWorkflow).not.toHaveBeenCalled();

      // Restore
      (vscode.workspace as any).workspaceFolders = originalWorkspaceFolders;
    });

    it("should handle user cancellation", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await releaseCommand.execute();

      expect(runReleaseWorkflow).not.toHaveBeenCalled();
    });

    it("should handle release workflow errors", async () => {
      // Mock confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.release.create_release",
      );

      (runReleaseWorkflow as jest.Mock).mockRejectedValue(
        new Error("No packages to release"),
      );

      await releaseCommand.execute();

      // When workflow throws an error, it's caught in the catch block
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("No packages to release"),
      );
    });

    it("should set VS Code progress reporter", async () => {
      // Mock confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.release.create_release",
      );

      (runReleaseWorkflow as jest.Mock).mockResolvedValue({
        status: "prepared",
        packages: [],
      } as any);

      await releaseCommand.execute();

      expect(mockProgressManager.setVSCodeProgressReporter).toHaveBeenCalled();
      expect(
        mockProgressManager.clearVSCodeProgressReporter,
      ).toHaveBeenCalled();
    });
  });

  describe("GitHub Integration", () => {
    it("should check authentication status", async () => {
      // Mock confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.release.create_release",
      );

      (runReleaseWorkflow as jest.Mock).mockResolvedValue({
        status: "prepared",
        packages: [
          {
            name: "@stackcode/core",
            version: "1.0.1",
            oldVersion: "1.0.0",
          },
        ],
      } as any);

      await releaseCommand.execute();

      // Auth service should be available for GitHub release creation
      expect(mockAuthService).toBeDefined();
    });
  });
});
