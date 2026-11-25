import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCommitCommand } from "../../src/commands/commit";
import * as core from "@stackcode/core";
import * as ui from "../../src/commands/ui";

vi.mock("@stackcode/core", () => ({
  getCommandOutput: vi.fn(),
  getCurrentBranch: vi.fn(),
  isProtectedBranch: vi.fn((branch: string | null) =>
    ["main", "master", "develop"].includes(branch ?? ""),
  ),
  runCommitWorkflow: vi.fn(),
  getErrorMessage: vi.fn((error: unknown) =>
    error instanceof Error ? error.message : String(error ?? "error"),
  ),
}));
vi.mock("../../src/commands/ui");

describe("Commit Command Handler", () => {
  const { handler } = getCommitCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.getCurrentBranch).mockResolvedValue("feature/login");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should format a simple commit message and call git commit", async () => {
    vi.mocked(core.getCommandOutput).mockResolvedValue(
      "M  packages/cli/src/commands/commit.ts",
    );

    vi.mocked(ui.promptForCommitAnswers).mockResolvedValue({
      type: "feat",
      scope: "api",
      shortDescription: "add new login endpoint",
      longDescription: "",
      breakingChanges: "",
      affectedIssues: "",
    });

    vi.mocked(core.runCommitWorkflow).mockResolvedValue({
      status: "committed",
      message: "feat(api): add new login endpoint",
    });

    await handler({ _: [], $0: "stc" });
    expect(core.runCommitWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "feat",
        scope: "api",
        shortDescription: "add new login endpoint",
      }),
    );
  });

  it("should format a complex commit message with body, breaking change, and footer", async () => {
    vi.mocked(core.getCommandOutput).mockResolvedValue(
      "M  packages/cli/src/commands/commit.ts",
    );

    vi.mocked(ui.promptForCommitAnswers).mockResolvedValue({
      type: "refactor",
      scope: "auth",
      shortDescription: "use JWT service for authentication",
      longDescription:
        "Implement new JWT service for better security.|Separate concerns.",
      breakingChanges:
        "The token format has changed and now requires a new validation method.",
      affectedIssues: "closes #42",
    });

    vi.mocked(core.runCommitWorkflow).mockResolvedValue({
      status: "committed",
      message: "",
    });

    await handler({ _: [], $0: "stc" });

    expect(core.runCommitWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "refactor",
        scope: "auth",
        shortDescription: "use JWT service for authentication",
        longDescription:
          "Implement new JWT service for better security.|Separate concerns.",
        breakingChanges:
          "The token format has changed and now requires a new validation method.",
        affectedIssues: "closes #42",
      }),
    );
  });

  describe("on a protected branch", () => {
    beforeEach(() => {
      vi.mocked(core.getCommandOutput).mockResolvedValue("M  src/index.ts");
      vi.mocked(core.getCurrentBranch).mockResolvedValue("develop");
      vi.mocked(ui.promptForCommitAnswers).mockResolvedValue({
        type: "fix",
        scope: "",
        shortDescription: "handle empty config",
        longDescription: "",
        breakingChanges: "",
        affectedIssues: "",
      });
      vi.mocked(core.runCommitWorkflow).mockResolvedValue({
        status: "committed",
        message: "fix: handle empty config",
      });
    });

    it("warns and stops when the user does not confirm", async () => {
      vi.mocked(ui.promptForConfirmation).mockResolvedValue(false);

      await handler({ _: [], $0: "stc" });

      expect(ui.log.warning).toHaveBeenCalled();
      expect(ui.promptForConfirmation).toHaveBeenCalledWith(
        expect.any(String),
        false,
      );
      expect(ui.promptForCommitAnswers).not.toHaveBeenCalled();
      expect(core.runCommitWorkflow).not.toHaveBeenCalled();
    });

    it("commits when the user confirms", async () => {
      vi.mocked(ui.promptForConfirmation).mockResolvedValue(true);

      await handler({ _: [], $0: "stc" });

      expect(core.runCommitWorkflow).toHaveBeenCalled();
    });
  });

  it("does not ask for confirmation on a feature branch", async () => {
    vi.mocked(core.getCommandOutput).mockResolvedValue("M  src/index.ts");
    vi.mocked(ui.promptForCommitAnswers).mockResolvedValue({
      type: "feat",
      scope: "",
      shortDescription: "add login",
      longDescription: "",
      breakingChanges: "",
      affectedIssues: "",
    });
    vi.mocked(core.runCommitWorkflow).mockResolvedValue({
      status: "committed",
      message: "feat: add login",
    });

    await handler({ _: [], $0: "stc" });

    expect(ui.promptForConfirmation).not.toHaveBeenCalled();
    expect(core.runCommitWorkflow).toHaveBeenCalled();
  });
});
