import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initEducationalMode,
  showEducationalMessage,
  showBestPractice,
} from "../../src/educational-mode";

const mockSet = vi.fn();
const mockGet = vi.fn();

vi.mock("configstore", () => ({
  default: vi.fn(() => ({
    set: (...args) => mockSet(...args),
    get: (...args) => mockGet(...args),
  })),
}));

vi.mock("@stackcode/i18n", () => ({
  t: vi.fn((key: string) => {
    const translations: Record<string, string> = {
      "educational.conventional_commits_explanation": "Conventional commits follow a standard that enables automation",
      "educational.gitignore_explanation": "A .gitignore file is being created to prevent secrets",
    };
    return translations[key] || key;
  }),
}));

describe("Educational Mode", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("initEducationalMode", () => {
    it("should enable educational mode when flag is true", () => {
      // Act
      initEducationalMode(true);
      // Assert 
      showEducationalMessage("educational.gitignore_explanation");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
    });

    it("should enable educational mode when global config is true", () => {
      // Arrange
      mockGet.mockReturnValue(true);
      // Act
      initEducationalMode(false);
      // Assert 
      expect(mockGet).toHaveBeenCalledWith("educate");
    });
    it("should disable educational mode when flag is false and config is false", () => {
      // Arrange
      mockGet.mockReturnValue(false);
      // Act
      initEducationalMode(false);
      consoleSpy.mockClear();
      // Act 
      showEducationalMessage("educational.gitignore_explanation");
      // Assert 
      expect(consoleSpy).not.toHaveBeenCalled();
    });
    it("should enable educational mode when flag is true even if config is false", () => {
      // Arrange
      mockGet.mockReturnValue(false);
      // Act
      initEducationalMode(true);
      // Assert 
      showEducationalMessage("educational.gitignore_explanation");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
    });
  });
  describe("showEducationalMessage", () => {
    beforeEach(() => {
      initEducationalMode(true); 
    });

    it("should display educational message with correct icon when enabled", () => {
      // Act
      showEducationalMessage("educational.gitignore_explanation");
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("A .gitignore file is being created")
      );
    });
    it("should show fallback message when translation is not found", () => {
      // Act 
      showEducationalMessage("educational.nonexistent_key");
      // Assert 
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
    });
    it("should not display message when educational mode is disabled", () => {
      // Arrange
      mockGet.mockReturnValue(false);
      initEducationalMode(false);
      // Act
      showEducationalMessage("educational.gitignore_explanation");
      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
  describe("showBestPractice", () => {
    beforeEach(() => {
      initEducationalMode(true); 
    });
    it("should display best practice message with correct icon when enabled", () => {
      // Act
      showBestPractice("educational.conventional_commits_explanation");
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("📚")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Conventional commits follow")
      );
    });

    it("should show fallback message for best practices when translation not found", () => {
      // Act
      showBestPractice("educational.unknown_practice");
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("📚")
      );
    });
    it("should not display best practice when educational mode is disabled", () => {
      // Arrange
      mockGet.mockReturnValue(false);
      initEducationalMode(false);
      // Act
      showBestPractice("educational.conventional_commits_explanation");
      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
  describe("Integration with Parameters", () => {
    it("should work with optional parameters in messages", () => {
      // Arrange
      initEducationalMode(true);
      // Act 
      showEducationalMessage("educational.scaffold_explanation");
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
    });
  });
  describe("Educational Mode State Management", () => {
    it("should maintain state across multiple calls", () => {
      // Arrange
      initEducationalMode(true);
      // Act 
      showEducationalMessage("educational.gitignore_explanation");
      showBestPractice("educational.conventional_commits_explanation");
      showEducationalMessage("educational.readme_explanation");
      // Assert 
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, expect.stringContaining("💡"));
      expect(consoleSpy).toHaveBeenNthCalledWith(2, expect.stringContaining("📚"));
      expect(consoleSpy).toHaveBeenNthCalledWith(3, expect.stringContaining("💡"));
    });
    it("should update behavior when mode is changed", () => {
      // Arrange 
      mockGet.mockReturnValue(false);
      initEducationalMode(false);
      // Act & Assert 
      showEducationalMessage("educational.gitignore_explanation");
      expect(consoleSpy).not.toHaveBeenCalled();
      // Arrange 
      initEducationalMode(true);
      // Act & Assert 
      showEducationalMessage("educational.gitignore_explanation");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("💡")
      );
    });
  });
});
