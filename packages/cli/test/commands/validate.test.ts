import { describe, it, expect, vi, beforeEach } from "vitest";
import { runValidateWorkflow } from "@stackcode/core";
import { getValidateCommand } from "../../src/commands/validate";

vi.mock("@stackcode/core", () => ({
  runValidateWorkflow: vi.fn(),
}));
vi.mock("@stackcode/i18n", () => ({ t: (key: string) => key }));

const mockedCore = {
  runValidateWorkflow: vi.mocked(runValidateWorkflow),
};

describe("Validate Command", () => {
  const { handler } = getValidateCommand();
  const mockProcessExit = vi
    .spyOn(process, "exit")
    .mockImplementation((() => {}) as () => never);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should log a success message for a valid commit message", async () => {
    // Arrange
    const argv = { message: "feat: add new feature", _: [], $0: "stc" };
    mockedCore.runValidateWorkflow.mockResolvedValue({ isValid: true });

    // Act
    await handler(argv as any);

    // Assert
    expect(mockedCore.runValidateWorkflow).toHaveBeenCalledWith({ message: argv.message });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("validate.success"),
    );
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it("should log an error and exit with code 1 for an invalid commit message", async () => {
    // Arrange
    const argv = { message: "invalid message", _: [], $0: "stc" };
    mockedCore.runValidateWorkflow.mockResolvedValue({ isValid: false });

    // Act
    await handler(argv as any);

    // Assert
    expect(mockedCore.runValidateWorkflow).toHaveBeenCalledWith({ message: argv.message });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("validate.error_invalid"),
    );
    expect(mockProcessExit).toHaveBeenCalledOnce();
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it.todo("yargs should enforce the message argument");
});
