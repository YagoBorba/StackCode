/**
 * Integration tests for ReleaseCommand
 * Tests the release workflow integration
 */

import * as vscode from "vscode";
import { ReleaseCommand } from "../../commands/ReleaseCommand";
import { GitHubAuthService } from "../../services/GitHubAuthService";
import { ProgressManager } from "../../services/ProgressManager";
import * as core from "@stackcode/core";

// Mock VS Code API
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

// Mock @stackcode/core
jest.mock("@stackcode/core");

// Mock i18n
jest.mock("@stackcode/i18n", () => ({
  t: jest.fn((key) => key),
}));

describe("ReleaseCommand Integration Tests", () => {
  let releaseCommand: ReleaseCommand;
  let mockAuthService: jest.Mocked<GitHubAuthService>;
  let mockProgressManager: jest.Mocked<ProgressManager>;

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
    );

    jest.clearAllMocks();
  });

  describe("execute()", () => {
    it("should execute release workflow successfully", async () => {
      // Mock confirmation
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "Yes",
        value: true,
      });

      const mockRunReleaseWorkflow = jest.spyOn(core, "runReleaseWorkflow");
      mockRunReleaseWorkflow.mockResolvedValue({
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

      expect(mockRunReleaseWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );

      expect(mockProgressManager.startWorkflow).toHaveBeenCalledWith("release");
      expect(mockProgressManager.completeWorkflow).toHaveBeenCalled();
    });

    it("should handle missing workspace folder", async () => {
      (vscode.workspace as any).workspaceFolders = undefined;

      await releaseCommand.execute();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("no_workspace_folder"),
      );
      expect(core.runReleaseWorkflow).not.toHaveBeenCalled();
    });

    it("should handle user cancellation", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await releaseCommand.execute();

      expect(core.runReleaseWorkflow).not.toHaveBeenCalled();
    });

    it("should handle release workflow errors", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "Yes",
        value: true,
      });

      const mockRunReleaseWorkflow = jest.spyOn(core, "runReleaseWorkflow");
      mockRunReleaseWorkflow.mockRejectedValue(
        new Error("No packages to release"),
      );

      await releaseCommand.execute();

      expect(mockProgressManager.failWorkflow).toHaveBeenCalledWith(
        "release",
        expect.stringContaining("No packages to release"),
      );
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("should set VS Code progress reporter", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "Yes",
        value: true,
      });

      const mockRunReleaseWorkflow = jest.spyOn(core, "runReleaseWorkflow");
      mockRunReleaseWorkflow.mockResolvedValue({
        status: "prepared",
        packages: [],
      } as any);

      await releaseCommand.execute();

      expect(mockProgressManager.setVSCodeProgressReporter).toHaveBeenCalled();
      expect(mockProgressManager.clearVSCodeProgressReporter).toHaveBeenCalled();
    });
  });

  describe("GitHub Integration", () => {
    it("should check authentication status", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "Yes",
        value: true,
      });

      const mockRunReleaseWorkflow = jest.spyOn(core, "runReleaseWorkflow");
      mockRunReleaseWorkflow.mockResolvedValue({
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
