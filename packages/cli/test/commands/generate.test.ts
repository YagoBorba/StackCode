import { describe, it, expect, vi, beforeEach } from "vitest";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import {
  runGenerateWorkflow,
  type GenerateWorkflowResult,
  type GenerateWorkflowOptions,
  type GenerateWorkflowHooks,
} from "@stackcode/core";
import { getGenerateCommand } from "../../src/commands/generate";
import * as ui from "../../src/commands/ui.js";

vi.mock("@stackcode/core", () => ({
  runGenerateWorkflow: vi.fn(),
}));

vi.mock("inquirer");

vi.mock("fs/promises");

vi.mock("@stackcode/i18n", () => ({ t: (key: string) => key }));
vi.mock("../../src/educational-mode.js", () => ({
  showEducationalMessage: vi.fn(),
}));

const mockedInquirer = vi.mocked(inquirer);
const mockedFs = vi.mocked(fs);
const mockedCore = {
  runGenerateWorkflow: vi.mocked(runGenerateWorkflow),
};

describe("Generate Command", () => {
  const { handler } = getGenerateCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    mockedCore.runGenerateWorkflow.mockResolvedValue({
      status: "completed",
      files: [],
      warnings: [],
    });
    mockedFs.readFile.mockResolvedValue('{ "stack": "node-ts" }');
  });

  describe("Non-Interactive Mode", () => {
    it("should generate a README.md when specified as an argument", async () => {
      const workflowResult: GenerateWorkflowResult = {
        status: "completed",
        files: [
          {
            fileType: "readme",
            filePath: path.join(process.cwd(), "README.md"),
            status: "created",
          },
        ],
        warnings: [],
      };
      mockedCore.runGenerateWorkflow.mockResolvedValueOnce(workflowResult);
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          files: ["readme"],
        }),
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("generate.success.readme"),
      );
    });

    it("should generate a .gitignore when specified as an argument", async () => {
      const workflowResult: GenerateWorkflowResult = {
        status: "completed",
        files: [
          {
            fileType: "gitignore",
            filePath: path.join(process.cwd(), ".gitignore"),
            status: "created",
          },
        ],
        warnings: [],
      };
      mockedCore.runGenerateWorkflow.mockResolvedValueOnce(workflowResult);
      mockedFs.readFile.mockResolvedValue('{ "stack": "node-ts" }');
      const argv = { filetype: "gitignore", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          files: ["gitignore"],
          gitignoreTechnologies: ["node-ts"],
        }),
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("generate.success.gitignore"),
      );
    });
  });

  describe("Interactive Mode", () => {
    it("should generate selected files when no argument is provided", async () => {
      // Arrange
      mockedInquirer.prompt.mockResolvedValue({
        filesToGenerate: ["readme", "gitignore"],
      });
      const workflowResult: GenerateWorkflowResult = {
        status: "completed",
        files: [
          {
            fileType: "readme",
            filePath: path.join(process.cwd(), "README.md"),
            status: "created",
          },
          {
            fileType: "gitignore",
            filePath: path.join(process.cwd(), ".gitignore"),
            status: "created",
          },
        ],
        warnings: [],
      };
      mockedCore.runGenerateWorkflow.mockResolvedValueOnce(workflowResult);
      const argv = { _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.arrayContaining(["readme", "gitignore"]),
        }),
        expect.any(Object),
      );
    });

    it("should cancel if user selects no files in interactive mode", async () => {
      // Arrange
      mockedInquirer.prompt.mockResolvedValue({ filesToGenerate: [] });
      const argv = { _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("common.operation_cancelled"),
      );
    });
  });

  describe("File Overwriting Logic", () => {
    it("should prompt for overwrite if file exists and proceed if confirmed", async () => {
      mockedCore.runGenerateWorkflow.mockImplementationOnce(
        async (
          options: GenerateWorkflowOptions,
          hooks?: GenerateWorkflowHooks,
        ) => {
          const promptSpy = vi.spyOn(ui, "promptForConfirmation");
          mockedInquirer.prompt.mockResolvedValueOnce({ confirm: true });
          const decision = await hooks?.shouldOverwriteFile?.({
            fileType: "readme",
            filePath: path.join(process.cwd(), "README.md"),
          });
          expect(promptSpy).toHaveBeenCalled();
          expect(decision).toBe(true);
          return {
            status: "completed",
            files: [
              {
                fileType: "readme",
                filePath: path.join(process.cwd(), "README.md"),
                status: "overwritten",
              },
            ],
            warnings: [],
          };
        },
      );
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("generate.success.readme"),
      );
    });

    it("should cancel if file exists and user denies overwrite", async () => {
      const workflowResult: GenerateWorkflowResult = {
        status: "cancelled",
        files: [
          {
            fileType: "readme",
            filePath: path.join(process.cwd(), "README.md"),
            status: "skipped",
            reason: "overwrite-declined",
          },
        ],
        warnings: [],
      };
      mockedCore.runGenerateWorkflow.mockResolvedValueOnce(workflowResult);
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.runGenerateWorkflow).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("common.operation_cancelled"),
      );
    });
  });
});
