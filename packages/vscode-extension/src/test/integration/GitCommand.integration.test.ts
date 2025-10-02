/**
 * @file Integration tests for GitCommand
 *
 * Tests Git Flow workflows (start branch, finish branch) with VSCode integration,
 * including user input validation, branch creation, and remote push operations.
 */

import * as vscode from "vscode";
import { GitCommand } from "../../commands/GitCommand";
import { runGitStartWorkflow, runGitFinishWorkflow } from "@stackcode/core";

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
  extensions: {
    getExtension: jest.fn().mockReturnValue(null),
  },
  ProgressLocation: {
    Notification: 15,
  },
  Uri: {
    file: jest.fn((path) => ({ fsPath: path })),
  },
}));

jest.mock("@stackcode/core", () => ({
  runGitStartWorkflow: jest.fn(),
  runGitFinishWorkflow: jest.fn(),
}));

jest.mock("@stackcode/i18n", () => ({
  t: jest.fn((key) => key),
}));

describe("GitCommand Integration Tests", () => {
  let gitCommand: GitCommand;

  beforeEach(() => {
    gitCommand = new GitCommand();
    jest.clearAllMocks();
  });

  describe("startBranch()", () => {
    it("should create and switch to a new branch", async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "new-feature",
      );

      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feature",
        description: "vscode.git.feature_description",
      });

      (runGitStartWorkflow as jest.Mock).mockResolvedValue({
        status: "created",
        branch: "feature/new-feature",
      } as any);

      await (gitCommand as any).startBranch();

      expect(runGitStartWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          branchName: "new-feature",
          branchType: "feature",
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );

      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it("should validate branch name format", async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "invalid branch name!",
      );

      await (gitCommand as any).startBranch();

      expect(runGitStartWorkflow).not.toHaveBeenCalled();
    });

    it("should handle empty branch name", async () => {
      // Mock empty input
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce("");

      await (gitCommand as any).startBranch();

      expect(runGitStartWorkflow).not.toHaveBeenCalled();
    });

    it("should handle git workflow errors", async () => {
      // Mock user input - branch name
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce("test");

      // Mock user input - branch type
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "feature",
        description: "vscode.git.feature_description",
      });

      (runGitStartWorkflow as jest.Mock).mockRejectedValue(
        new Error("Branch already exists"),
      );

      await (gitCommand as any).startBranch();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("vscode.git.failed_create_branch"),
      );
    });
  });

  describe("finishBranch()", () => {
    it("should merge and cleanup branch", async () => {
      // Mock confirmation with showWarningMessage
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.git.finish_branch",
      );

      (runGitFinishWorkflow as jest.Mock).mockResolvedValue({
        status: "merged",
        branch: "feature/old-feature",
      } as any);

      await (gitCommand as any).finishBranch();

      expect(runGitFinishWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );
    });

    it("should handle user cancellation", async () => {
      // Mock user cancelling the confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await (gitCommand as any).finishBranch();

      expect(runGitFinishWorkflow).not.toHaveBeenCalled();
    });
  });

  describe("execute()", () => {
    it("should show action picker and execute start", async () => {
      // Mock action selection
      (vscode.window.showQuickPick as jest.Mock)
        .mockResolvedValueOnce({
          label: "start",
        })
        // Mock branch type selection
        .mockResolvedValueOnce({
          label: "feature",
          description: "vscode.git.feature_description",
        });

      // Mock branch name input
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce("test");

      (runGitStartWorkflow as jest.Mock).mockResolvedValue({
        status: "created",
        branch: "feature/test",
      } as any);

      await gitCommand.execute();

      expect(runGitStartWorkflow).toHaveBeenCalled();
    });

    it("should show action picker and execute finish", async () => {
      // Mock action selection
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "finish",
      });

      // Mock confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValueOnce(
        "vscode.git.finish_branch",
      );

      (runGitFinishWorkflow as jest.Mock).mockResolvedValue({
        status: "merged",
      } as any);

      await gitCommand.execute();

      expect(runGitFinishWorkflow).toHaveBeenCalled();
    });
  });
});
