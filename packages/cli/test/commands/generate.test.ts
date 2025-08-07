import { describe, it, expect, vi, beforeEach } from "vitest";
import inquirer from "inquirer";
import fs from "fs/promises";
import {
  generateGitignoreContent,
  generateReadmeContent,
} from "@stackcode/core";
import { getGenerateCommand } from "../../src/commands/generate";

vi.mock("@stackcode/core", () => ({
  generateReadmeContent: vi.fn(),
  generateGitignoreContent: vi.fn(),
}));

vi.mock("inquirer");

vi.mock("fs/promises");

vi.mock("@stackcode/i18n", () => ({ t: (key: string) => key }));

const mockedInquirer = vi.mocked(inquirer);
const mockedFs = vi.mocked(fs);
const mockedCore = {
  generateReadmeContent: vi.mocked(generateReadmeContent),
  generateGitignoreContent: vi.mocked(generateGitignoreContent),
};

describe("Generate Command", () => {
  const { handler } = getGenerateCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Non-Interactive Mode", () => {
    it("should generate a README.md when specified as an argument", async () => {
      // Arrange
      const mockContent = "# Mocked README";
      mockedCore.generateReadmeContent.mockResolvedValue(mockContent);
      mockedFs.access.mockRejectedValue(new Error("File not found"));
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.generateReadmeContent).toHaveBeenCalledOnce();
      expect(mockedFs.writeFile).toHaveBeenCalledOnce();
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("README.md"),
        mockContent,
      );
      expect(console.log).toHaveBeenCalledWith("generate.success.readme");
    });

    it("should generate a .gitignore when specified as an argument", async () => {
      // Arrange
      const mockContent = "node_modules/";
      mockedCore.generateGitignoreContent.mockResolvedValue(mockContent);
      mockedFs.access.mockRejectedValue(new Error("File not found"));
      mockedFs.readFile.mockResolvedValue('{ "stack": "node-ts" }');
      const argv = { filetype: "gitignore", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedCore.generateGitignoreContent).toHaveBeenCalledWith([
        "node-ts",
      ]);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".gitignore"),
        mockContent,
      );
      expect(console.log).toHaveBeenCalledWith("generate.success.gitignore");
    });
  });

  describe("Interactive Mode", () => {
    it("should generate selected files when no argument is provided", async () => {
      // Arrange
      mockedInquirer.prompt.mockResolvedValue({
        filesToGenerate: ["readme", "gitignore"],
      });
      mockedCore.generateReadmeContent.mockResolvedValue("# README");
      mockedCore.generateGitignoreContent.mockResolvedValue("node_modules");
      mockedFs.access.mockRejectedValue(new Error("File not found"));
      const argv = { _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(2);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("README.md"),
        "# README",
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".gitignore"),
        "node_modules",
      );
    });

    it("should cancel if user selects no files in interactive mode", async () => {
      // Arrange
      mockedInquirer.prompt.mockResolvedValue({ filesToGenerate: [] });
      const argv = { _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("common.operation_cancelled");
    });
  });

  describe("File Overwriting Logic", () => {
    it("should prompt for overwrite if file exists and proceed if confirmed", async () => {
      // Arrange
      mockedFs.access.mockResolvedValue(undefined);
      mockedInquirer.prompt.mockResolvedValue({ confirm: true });
      mockedCore.generateReadmeContent.mockResolvedValue("# Overwritten");
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedInquirer.prompt).toHaveBeenCalledOnce();
      expect(mockedFs.writeFile).toHaveBeenCalledOnce();
    });

    it("should cancel if file exists and user denies overwrite", async () => {
      // Arrange
      mockedFs.access.mockResolvedValue(undefined);
      mockedInquirer.prompt.mockResolvedValue({ confirm: false });
      const argv = { filetype: "readme", _: [], $0: "stc" };

      // Act
      await handler(argv);

      // Assert
      expect(mockedInquirer.prompt).toHaveBeenCalledOnce();
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("common.operation_cancelled");
    });
  });
});
