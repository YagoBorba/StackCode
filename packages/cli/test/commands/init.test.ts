import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";
import inquirer from "inquirer";
import fs from "fs/promises";
import { runInitWorkflow, type InitWorkflowResult } from "@stackcode/core";
import { getInitCommand } from "../../src/commands/init";

vi.mock("@stackcode/core", () => ({
  runInitWorkflow: vi.fn(),
}));

vi.mock("inquirer");
vi.mock("fs/promises");
vi.mock("@stackcode/i18n", () => ({ t: (key: string) => key }));
vi.mock("../../src/educational-mode.js", () => ({
  initEducationalMode: vi.fn(),
  showEducationalMessage: vi.fn(),
}));

const mockedInquirer = vi.mocked(inquirer);
const mockedFs = vi.mocked(fs);
const mockedCore = {
  runInitWorkflow: vi.mocked(runInitWorkflow),
};

describe("Init Command", () => {
  const { handler } = getInitCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should run the full project initialization flow successfully", async () => {
    const mockAnswers = {
      projectName: "test-project",
      description: "A test project.",
      authorName: "Test Author",
      stack: "node-ts",
      features: ["docker", "husky"],
      commitValidation: true,
    };
    mockedInquirer.prompt.mockResolvedValue(mockAnswers);
    mockedFs.access.mockRejectedValue(new Error("not found"));
    const workflowResult: InitWorkflowResult = {
      status: "completed",
      projectPath: path.join(process.cwd(), mockAnswers.projectName),
      dependencyValidation: {
        isValid: true,
        missingDependencies: [],
        availableDependencies: ["npm"],
      },
      dependenciesInstalled: true,
      installCommand: { command: "npm", args: ["install"] },
      warnings: [],
    };
    mockedCore.runInitWorkflow.mockResolvedValue(workflowResult);

    // Act
    await handler({ _: [], $0: "stc" });
    // Assert
    const projectPath = expect.stringContaining(mockAnswers.projectName);

    expect(mockedCore.runInitWorkflow).toHaveBeenCalledWith(
      {
        projectPath,
        projectName: mockAnswers.projectName,
        description: mockAnswers.description,
        authorName: mockAnswers.authorName,
        stack: mockAnswers.stack,
        features: mockAnswers.features,
        commitValidation: mockAnswers.commitValidation,
      },
      expect.objectContaining({
        onProgress: expect.any(Function),
        onEducationalMessage: expect.any(Function),
        onMissingDependencies: expect.any(Function),
        confirmContinueAfterMissingDependencies: expect.any(Function),
      }),
    );

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("init.success.ready"),
    );
  });

  it("should cancel the operation if user denies overwrite", async () => {
    // Arrange
    const mockAnswers = { projectName: "existing-project" };
    mockedInquirer.prompt
      .mockResolvedValueOnce(mockAnswers)
      .mockResolvedValueOnce({ overwrite: false });
    mockedFs.access.mockResolvedValue(undefined);

    // Act
    await handler({ _: [], $0: "stc" });

    // Assert
    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(2);
    expect(mockedCore.runInitWorkflow).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("common.operation_cancelled"),
    );
  });
});
