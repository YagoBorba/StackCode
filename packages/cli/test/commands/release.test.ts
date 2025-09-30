import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getReleaseCommand } from "../../src/commands/release";
import * as core from "@stackcode/core";
import * as ui from "../../src/commands/ui.js";

type ViMock = ReturnType<typeof vi.fn>;

interface MockReleaseResult {
  status: "prepared" | "cancelled";
  strategy: "locked" | "independent" | "unknown";
  newVersion?: string;
  releaseNotes?: string;
  tagName?: string;
  github?: { owner: string; repo: string; remoteUrl: string };
  reason?:
    | "invalid-structure"
    | "cancelled-by-user"
    | "no-changes"
    | "no-bumps"
    | "error";
}

const authManagerInstance = vi.hoisted(() => ({
  getToken: vi.fn(),
  saveToken: vi.fn(),
  removeToken: vi.fn(),
  validateToken: vi.fn(),
}));

vi.mock("@stackcode/core", () => {
  const runReleaseWorkflow = vi.fn();
  const createGitHubRelease = vi.fn();
  return {
    runReleaseWorkflow,
    createGitHubRelease,
    getCommandOutput: vi.fn(),
    getErrorMessage: vi.fn((error: unknown) =>
      error instanceof Error ? error.message : String(error),
    ),
  };
});

vi.mock("../../src/services/githubAuth.js", () => ({
  CLIAuthManager: vi.fn(() => authManagerInstance),
  getCurrentRepository: vi.fn(),
}));

vi.mock("../../src/commands/ui.js", () => ({
  log: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    gray: vi.fn(),
  },
  promptToCreateGitHubRelease: vi.fn().mockResolvedValue(false),
  promptForToken: vi.fn(),
  promptToSaveToken: vi.fn(),
  promptForLockedRelease: vi.fn().mockResolvedValue(true),
  promptForIndependentRelease: vi.fn().mockResolvedValue(true),
  displayIndependentReleasePlan: vi.fn(),
}));

const coreModule = core as Record<string, unknown>;
const runReleaseWorkflowMock = coreModule["runReleaseWorkflow"] as ViMock;
const createGitHubReleaseMock = coreModule["createGitHubRelease"] as ViMock;
const getErrorMessageMock = coreModule["getErrorMessage"] as ViMock;
const getCommandOutputMock = coreModule["getCommandOutput"] as ViMock;

describe("Release Command Handler", () => {
  const { handler } = getReleaseCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "table").mockImplementation(() => {});

    authManagerInstance.getToken.mockReset();
    authManagerInstance.saveToken.mockReset();
    authManagerInstance.removeToken.mockReset();
    authManagerInstance.validateToken.mockReset();
    runReleaseWorkflowMock.mockReset();
    createGitHubReleaseMock.mockReset();
    getErrorMessageMock.mockReset();
    getCommandOutputMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles a locked release prepared by the workflow", async () => {
    runReleaseWorkflowMock.mockResolvedValue({
      status: "prepared",
      strategy: "locked",
      newVersion: "1.1.0",
      releaseNotes: "Notes",
      tagName: "v1.1.0",
    } as MockReleaseResult);

    // @ts-expect-error - Testing with empty options object
    await handler({});

    expect(runReleaseWorkflowMock).toHaveBeenCalled();
    expect(ui.log.success).toHaveBeenCalledWith(
      expect.stringContaining("release.success_ready_to_commit"),
    );
    expect(createGitHubReleaseMock).not.toHaveBeenCalled();
  });

  it("logs when there are no changes in independent strategy", async () => {
    runReleaseWorkflowMock.mockResolvedValue({
      status: "cancelled",
      strategy: "independent",
      reason: "no-changes",
    } as MockReleaseResult);

    // @ts-expect-error - Testing with empty options object
    await handler({});

    expect(ui.log.success).toHaveBeenCalledWith(
      expect.stringContaining("release.independent_mode_no_changes"),
    );
  });

  it("creates a GitHub release when requested", async () => {
    runReleaseWorkflowMock.mockResolvedValue({
      status: "prepared",
      strategy: "locked",
      newVersion: "1.2.0",
      releaseNotes: "Notes",
      tagName: "v1.2.0",
      github: { owner: "owner", repo: "repo", remoteUrl: "remote" },
    } as MockReleaseResult);

    vi.mocked(ui.promptToCreateGitHubRelease).mockResolvedValue(true);
    authManagerInstance.getToken.mockReturnValue("gh_token");
    authManagerInstance.validateToken.mockResolvedValue(true);

    // @ts-expect-error - Testing with empty options object
    await handler({});

    expect(createGitHubReleaseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "owner",
        repo: "repo",
        tagName: "v1.2.0",
      }),
    );
  });

  it("exits when structure is invalid", async () => {
    runReleaseWorkflowMock.mockResolvedValue({
      status: "cancelled",
      strategy: "unknown",
      reason: "invalid-structure",
    } as MockReleaseResult);

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(
      (() => {
        throw new Error("exit");
      }) as unknown as typeof process.exit,
    );

    await expect(async () => {
      // @ts-expect-error - Testing with empty options object
      await handler({});
    }).rejects.toThrow("exit");

    expect(ui.log.error).toHaveBeenCalledWith(
      expect.stringContaining("structure"),
    );
    exitSpy.mockRestore();
  });
});
