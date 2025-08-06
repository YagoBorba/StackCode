import { describe, it, expect, vi, beforeEach } from "vitest";
import { performReleaseCommit } from "../src/release";
import * as utils from "../src/utils";
import type { PackageBumpInfo } from "../src/types";

vi.mock("../src/utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/utils")>();
  return {
    ...original,
    runCommand: vi.fn(),
  };
});

const runCommandMock = vi.mocked(utils.runCommand);

describe("performReleaseCommit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should run git add, commit, and tag in the correct order", async () => {
    const mockPkgInfo: PackageBumpInfo = {
      pkg: { name: "@stackcode/cli", path: "/fake/path/to/cli" },
      bumpType: "minor",
      newVersion: "1.2.0",
    };
    const projectRoot = "/fake/path";

    await performReleaseCommit([mockPkgInfo], projectRoot);

    expect(runCommandMock).toHaveBeenCalledWith(
      "git",
      [
        "add",
        "/fake/path/to/cli/package.json",
        "/fake/path/to/cli/CHANGELOG.md",
      ],
      { cwd: projectRoot },
    );

    expect(runCommandMock).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "chore(release): release\n\n- cli@1.2.0\n"],
      { cwd: projectRoot },
    );

    // Verifica o git tag
    expect(runCommandMock).toHaveBeenCalledWith("git", ["tag", "cli@1.2.0"], {
      cwd: projectRoot,
    });

    expect(runCommandMock.mock.calls.length).toBe(3);
    expect(runCommandMock.mock.calls[0][1]?.[0]).toBe("add");
    expect(runCommandMock.mock.calls[1][1]?.[0]).toBe("commit");
    expect(runCommandMock.mock.calls[2][1]?.[0]).toBe("tag");
  });

  it("should create a consolidated commit for multiple packages", async () => {
    // Setup com múltiplos pacotes
    const mockPackages: PackageBumpInfo[] = [
      {
        pkg: { name: "@stackcode/cli", path: "/fake/path/to/cli" },
        bumpType: "minor",
        newVersion: "1.2.0",
      },
      {
        pkg: { name: "@stackcode/core", path: "/fake/path/to/core" },
        bumpType: "patch",
        newVersion: "1.1.1",
      },
    ];
    const projectRoot = "/fake/path";

    // Act
    await performReleaseCommit(mockPackages, projectRoot);

    expect(runCommandMock).toHaveBeenCalledWith(
      "git",
      [
        "add",
        "/fake/path/to/cli/package.json",
        "/fake/path/to/cli/CHANGELOG.md",
        "/fake/path/to/core/package.json",
        "/fake/path/to/core/CHANGELOG.md",
      ],
      { cwd: projectRoot },
    );

    expect(runCommandMock).toHaveBeenCalledWith(
      "git",
      [
        "commit",
        "-m",
        "chore(release): release\n\n- cli@1.2.0\n- core@1.1.1\n",
      ],
      { cwd: projectRoot },
    );

    expect(runCommandMock.mock.calls.length).toBe(4);
  });
});
