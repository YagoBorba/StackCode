/**
 * Integration tests for GitCommand
 * Tests git start and finish workflows
 */

import * as vscode from "vscode";
import { GitCommand } from "../../commands/GitCommand";
import * as core from "@stackcode/core";

// Mock VS Code API
jest.mock("vscode", () => ({
  window: {
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
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

describe("GitCommand Integration Tests", () => {
  let gitCommand: GitCommand;

  beforeEach(() => {
    gitCommand = new GitCommand();
    jest.clearAllMocks();
  });

  describe("startBranch()", () => {
    it("should create and switch to a new branch", async () => {
      // Mock user input
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "feature/new-feature",
      );

      const mockRunGitStartWorkflow = jest.spyOn(core, "runGitStartWorkflow");
      mockRunGitStartWorkflow.mockResolvedValue({
        status: "created",
        branch: "feature/new-feature",
      } as any);

      await (gitCommand as any).startBranch();

      expect(mockRunGitStartWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          branchName: "feature/new-feature",
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );

      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it("should validate branch name format", async () => {
      // Mock invalid branch name
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "invalid branch name!",
      );

      await (gitCommand as any).startBranch();

      expect(core.runGitStartWorkflow).not.toHaveBeenCalled();
    });

    it("should handle empty branch name", async () => {
      // Mock empty input
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce("");

      await (gitCommand as any).startBranch();

      expect(core.runGitStartWorkflow).not.toHaveBeenCalled();
    });

    it("should handle git workflow errors", async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "feature/test",
      );

      const mockRunGitStartWorkflow = jest.spyOn(core, "runGitStartWorkflow");
      mockRunGitStartWorkflow.mockRejectedValue(
        new Error("Branch already exists"),
      );

      await (gitCommand as any).startBranch();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("Branch already exists"),
      );
    });
  });

  describe("finishBranch()", () => {
    it("should merge and cleanup branch", async () => {
      // Mock confirmation
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "Yes",
        value: true,
      });

      const mockRunGitFinishWorkflow = jest.spyOn(
        core,
        "runGitFinishWorkflow",
      );
      mockRunGitFinishWorkflow.mockResolvedValue({
        status: "merged",
        branch: "feature/old-feature",
      } as any);

      await (gitCommand as any).finishBranch();

      expect(mockRunGitFinishWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: "/test/workspace",
        }),
        expect.any(Object),
      );
    });

    it("should handle user cancellation", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await (gitCommand as any).finishBranch();

      expect(core.runGitFinishWorkflow).not.toHaveBeenCalled();
    });
  });

  describe("execute()", () => {
    it("should show action picker and execute start", async () => {
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
        label: "start",
      });
      (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(
        "feature/test",
      );

      const mockRunGitStartWorkflow = jest.spyOn(core, "runGitStartWorkflow");
      mockRunGitStartWorkflow.mockResolvedValue({
        status: "created",
        branch: "feature/test",
      } as any);

      await gitCommand.execute();

      expect(mockRunGitStartWorkflow).toHaveBeenCalled();
    });

    it("should show action picker and execute finish", async () => {
      (vscode.window.showQuickPick as jest.Mock)
        .mockResolvedValueOnce({
          label: "finish",
        })
        .mockResolvedValueOnce({
          label: "Yes",
          value: true,
        });

      const mockRunGitFinishWorkflow = jest.spyOn(
        core,
        "runGitFinishWorkflow",
      );
      mockRunGitFinishWorkflow.mockResolvedValue({
        status: "merged",
      } as any);

      await gitCommand.execute();

      expect(mockRunGitFinishWorkflow).toHaveBeenCalled();
    });
  });
});
