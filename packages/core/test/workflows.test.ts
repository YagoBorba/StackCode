import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import {
  runInitWorkflow,
  runGenerateWorkflow,
  runValidateWorkflow,
  runCommitWorkflow,
  runGitStartWorkflow,
  runGitFinishWorkflow,
  runReleaseWorkflow,
  type InitWorkflowHooks,
  type InitWorkflowOptions,
  type GenerateWorkflowHooks,
  type GenerateWorkflowOptions,
  type ValidateWorkflowHooks,
  type ValidateWorkflowOptions,
  type ReleaseWorkflowHooks,
} from "../src/workflows.js";
import * as scaffoldModule from "../src/scaffold.js";
import * as utilsModule from "../src/utils.js";
import * as generatorsModule from "../src/generators.js";
import * as releaseModule from "../src/release.js";

vi.mock("fs/promises");
vi.mock("path", async (importOriginal) => {
  const actual = await importOriginal<typeof import("path")>();
  return {
    ...actual,
    join: (...segments: string[]) => segments.join("/"),
  };
});
vi.mock("../src/scaffold.js");
vi.mock("../src/utils.js");
vi.mock("../src/generators.js");
vi.mock("../src/release.js");

const mockedFs = fs as unknown as {
  writeFile: ReturnType<typeof vi.fn>;
  access: ReturnType<typeof vi.fn>;
  readFile: ReturnType<typeof vi.fn>;
};

describe("runInitWorkflow", () => {
  const baseOptions: InitWorkflowOptions = {
    projectPath: "/tmp/demo",
    projectName: "demo",
    description: "Demo project",
    authorName: "Jane Doe",
    stack: "node-ts",
    features: ["docker", "husky"],
    commitValidation: true,
  };

  const hooks: InitWorkflowHooks = {
    onProgress: vi.fn(),
    onEducationalMessage: vi.fn(),
    onMissingDependencies: vi.fn(),
    confirmContinueAfterMissingDependencies: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (scaffoldModule.scaffoldProject as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (scaffoldModule.setupHusky as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (generatorsModule.generateReadmeContent as ReturnType<typeof vi.fn>).mockResolvedValue(
      "# Demo",
    );
    (generatorsModule.generateGitignoreContent as ReturnType<typeof vi.fn>).mockResolvedValue(
      "node_modules",
    );
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (utilsModule.saveStackCodeConfig as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (utilsModule.loadStackCodeConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
      stack: "node-ts",
      features: {
        commitValidation: false,
        husky: false,
        docker: false,
      },
    });
    (utilsModule.validateStackDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      isValid: true,
      missingDependencies: [],
      availableDependencies: ["npm"],
    });
    (mockedFs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mockedFs.access as ReturnType<typeof vi.fn>)
      .mockRejectedValue(new Error("not found"));
    (mockedFs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("not found"),
    );
  });

  it("completes successfully when dependencies install", async () => {
    const result = await runInitWorkflow(baseOptions, hooks);

    expect(result.status).toBe("completed");
    expect(result.dependenciesInstalled).toBe(true);
    expect(result.dependencyValidation.isValid).toBe(true);
    expect(scaffoldModule.scaffoldProject).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: baseOptions.projectPath }),
    );
    expect(utilsModule.runCommand).toHaveBeenCalledWith("npm", ["install"], {
      cwd: baseOptions.projectPath,
    });
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.join(baseOptions.projectPath, "README.md"),
      "# Demo",
    );
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.join(baseOptions.projectPath, ".gitignore"),
      "node_modules",
    );
    expect(utilsModule.saveStackCodeConfig).toHaveBeenCalledWith(
      baseOptions.projectPath,
      expect.objectContaining({ stack: baseOptions.stack }),
    );
  });

  it("returns cancellation when user declines after missing dependencies", async () => {
    (utilsModule.validateStackDependencies as ReturnType<typeof vi.fn>).mockResolvedValue({
      isValid: false,
      missingDependencies: ["npm"],
      availableDependencies: [],
    });
    (hooks.confirmContinueAfterMissingDependencies as ReturnType<(typeof vi.fn)>).mockResolvedValue(
      false,
    );

    const result = await runInitWorkflow(baseOptions, hooks);

    expect(result.status).toBe("cancelled");
    expect(result.dependenciesInstalled).toBe(false);
    expect(utilsModule.runCommand).not.toHaveBeenCalledWith("npm", ["install"], {
      cwd: baseOptions.projectPath,
    });
  });

  it("collects warnings when dependency installation fails", async () => {
    (utilsModule.runCommand as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(undefined) // git init
      .mockRejectedValueOnce(new Error("install failed")); // install command

    const result = await runInitWorkflow(baseOptions, hooks);

    expect(result.status).toBe("completed");
    expect(result.dependenciesInstalled).toBe(false);
    expect(result.warnings).toContain("install failed");
  });
});

describe("runGenerateWorkflow", () => {
  const baseOptions: GenerateWorkflowOptions = {
    projectPath: "/tmp/demo",
    files: ["readme"],
  };

  const hooks: GenerateWorkflowHooks = {
    onProgress: vi.fn(),
    onEducationalMessage: vi.fn(),
    shouldOverwriteFile: vi.fn(),
    resolveGitignoreTechnologies: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (mockedFs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mockedFs.access as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("not found"),
    );
    (generatorsModule.generateReadmeContent as ReturnType<typeof vi.fn>).mockResolvedValue(
      "# Demo README",
    );
    (generatorsModule.generateGitignoreContent as ReturnType<typeof vi.fn>).mockResolvedValue(
      "node_modules",
    );
    (hooks.shouldOverwriteFile as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (hooks.resolveGitignoreTechnologies as ReturnType<typeof vi.fn>).mockResolvedValue([
      "node-ts",
    ]);
  });

  it("generates a README file when not present", async () => {
    const result = await runGenerateWorkflow(baseOptions, hooks);

    expect(result.status).toBe("completed");
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toMatchObject({
      fileType: "readme",
      status: "created",
    });
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.join(baseOptions.projectPath, "README.md"),
      "# Demo README",
    );
    expect(hooks.shouldOverwriteFile).not.toHaveBeenCalled();
  });

  it("skips file generation when overwrite is declined", async () => {
    (mockedFs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (hooks.shouldOverwriteFile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

    const result = await runGenerateWorkflow(baseOptions, hooks);

    expect(result.status).toBe("cancelled");
    expect(result.files[0]).toMatchObject({
      fileType: "readme",
      status: "skipped",
      reason: "overwrite-declined",
    });
    expect(mockedFs.writeFile).not.toHaveBeenCalled();
  });

  it("uses provided technologies to generate .gitignore", async () => {
    const options: GenerateWorkflowOptions = {
      ...baseOptions,
      files: ["gitignore"],
      gitignoreTechnologies: ["react"],
    };

    const result = await runGenerateWorkflow(options, hooks);

    expect(result.status).toBe("completed");
    expect(generatorsModule.generateGitignoreContent).toHaveBeenCalledWith([
      "react",
    ]);
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.join(baseOptions.projectPath, ".gitignore"),
      "node_modules",
    );
  });

  it("infers gitignore technologies from project configuration when none provided", async () => {
    (utilsModule.loadStackCodeConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
      stack: "vue",
      features: {},
    });
    (hooks.resolveGitignoreTechnologies as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    const options: GenerateWorkflowOptions = {
      ...baseOptions,
      files: ["gitignore"],
    };

    const result = await runGenerateWorkflow(options, hooks);

    expect(result.status).toBe("completed");
    expect(generatorsModule.generateGitignoreContent).toHaveBeenCalledWith([
      "vue",
    ]);
  });
});

describe("runValidateWorkflow", () => {
  it("returns isValid=true for a valid commit message and reports progress", async () => {
    const hooks: ValidateWorkflowHooks = { onProgress: vi.fn() };
    const options: ValidateWorkflowOptions = { message: "feat: add feature" };

    const result = await runValidateWorkflow(options, hooks);

    expect(result.isValid).toBe(true);
    expect(hooks.onProgress).toHaveBeenCalledWith({ step: "validating" });
    expect(hooks.onProgress).toHaveBeenCalledWith({ step: "completed" });
  });

  it("returns isValid=false for an invalid commit message", async () => {
    const hooks: ValidateWorkflowHooks = { onProgress: vi.fn() };
    const options: ValidateWorkflowOptions = { message: "invalid" };

    const result = await runValidateWorkflow(options, hooks);

    expect(result.isValid).toBe(false);
  });
});

describe("runCommitWorkflow", () => {
  const baseOptions = {
    cwd: "/repo",
    type: "feat",
    scope: "api",
    shortDescription: "add endpoint",
    longDescription: "Add endpoint.|Handle errors.",
    breakingChanges: "Changed response format",
    affectedIssues: "closes #123",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (utilsModule.getCommandOutput as ReturnType<typeof vi.fn>).mockResolvedValue(
      "M file.ts",
    );
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it("commits successfully when staged changes exist", async () => {
    const result = await runCommitWorkflow(baseOptions);

    expect(result.status).toBe("committed");
    expect(result.message).toBeDefined();
    const message = result.message!;
    expect(message).toContain("feat(api): add endpoint");
    expect(message).toContain("Add endpoint.\nHandle errors.");
    expect(message).toContain("BREAKING CHANGE: Changed response format");
    expect(message).toContain("closes #123");
    expect(utilsModule.runCommand).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", message],
      { cwd: baseOptions.cwd },
    );
  });

  it("returns cancelled when there are no staged changes", async () => {
    (utilsModule.getCommandOutput as ReturnType<typeof vi.fn>).mockResolvedValue(
      "",
    );

    const result = await runCommitWorkflow(baseOptions);

    expect(result.status).toBe("cancelled");
    expect(result.reason).toBe("no-staged-changes");
    expect(utilsModule.runCommand).not.toHaveBeenCalled();
  });

  it("returns error when git commit fails", async () => {
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("commit failed"),
    );

    const result = await runCommitWorkflow(baseOptions);

    expect(result.status).toBe("cancelled");
    expect(result.reason).toBe("error");
    expect(result.error).toContain("commit failed");
  });
});

describe("runGitStartWorkflow", () => {
  const options = {
    cwd: "/repo",
    branchName: "awesome",
    branchType: "feature",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it("creates a feature branch from develop", async () => {
    const result = await runGitStartWorkflow(options);

    expect(result.status).toBe("created");
    expect(result.fullBranchName).toBe("feature/awesome");
    expect(utilsModule.runCommand).toHaveBeenNthCalledWith(
      1,
      "git",
      ["checkout", "develop"],
      { cwd: options.cwd },
    );
    expect(utilsModule.runCommand).toHaveBeenNthCalledWith(
      2,
      "git",
      ["pull", "origin", "develop"],
      { cwd: options.cwd },
    );
    expect(utilsModule.runCommand).toHaveBeenNthCalledWith(
      3,
      "git",
      ["checkout", "-b", "feature/awesome"],
      { cwd: options.cwd },
    );
  });

  it("returns cancelled when git checkout fails", async () => {
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("checkout failed"),
    );

    const result = await runGitStartWorkflow(options);

    expect(result.status).toBe("cancelled");
    expect(result.error).toContain("checkout failed");
  });
});

describe("runGitFinishWorkflow", () => {
  const options = { cwd: "/repo" };

  beforeEach(() => {
    vi.resetAllMocks();
    (utilsModule.runCommand as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });

  it("pushes current branch and returns PR URL", async () => {
    (utilsModule.getCommandOutput as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("feature/awesome")
      .mockResolvedValueOnce("git@github.com:acme/project.git");

    const result = await runGitFinishWorkflow(options);

    expect(result.status).toBe("pushed");
    expect(result.branch).toBe("feature/awesome");
    expect(result.prUrl).toBe(
      "https://github.com/acme/project/pull/new/feature/awesome",
    );
    expect(utilsModule.runCommand).toHaveBeenCalledWith(
      "git",
      ["push", "--set-upstream", "origin", "feature/awesome"],
      { cwd: options.cwd },
    );
  });

  it("returns cancelled when not on a branch", async () => {
    (utilsModule.getCommandOutput as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      "",
    );

    const result = await runGitFinishWorkflow(options);

    expect(result.status).toBe("cancelled");
    expect(result.error).toBe("not-on-branch");
  });
});

describe("runReleaseWorkflow", () => {
  const cwd = "/repo";

  beforeEach(() => {
    vi.resetAllMocks();
    (mockedFs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (mockedFs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("not found"),
    );
    (utilsModule.getCommandOutput as ReturnType<typeof vi.fn>).mockResolvedValue(
      "git@github.com:org/repo.git",
    );
  });

  it("prepares a locked release when confirmed", async () => {
    vi.mocked(releaseModule.detectVersioningStrategy).mockResolvedValue({
      strategy: "locked",
      rootDir: cwd,
      rootVersion: "1.2.3",
      packages: [],
    });
    vi.mocked(releaseModule.getRecommendedBump).mockResolvedValue("patch");
    vi.mocked(releaseModule.updateAllVersions).mockResolvedValue();
    vi.mocked(releaseModule.generateChangelog).mockResolvedValue("# Changelog");
    (mockedFs.readFile as ReturnType<typeof vi.fn>).mockResolvedValueOnce("");

    const confirmLockedRelease = vi.fn().mockResolvedValue(true);
    const hooks: ReleaseWorkflowHooks = {
      confirmLockedRelease: async (details) => {
        expect(details.currentVersion).toBe("1.2.3");
        expect(details.newVersion).toBe("1.2.4");
        return confirmLockedRelease();
      },
    };

    const result = await runReleaseWorkflow({ cwd }, hooks);

    expect(result.status).toBe("prepared");
    expect(result.strategy).toBe("locked");
    expect(result.newVersion).toBe("1.2.4");
    expect(result.tagName).toBe("v1.2.4");
    expect(result.releaseNotes).toBe("# Changelog");
    expect(result.github).toEqual(
      expect.objectContaining({ owner: "org", repo: "repo" }),
    );
    expect(releaseModule.updateAllVersions).toHaveBeenCalledWith(
      expect.objectContaining({ rootDir: cwd }),
      "1.2.4",
    );
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      `${cwd}/CHANGELOG.md`,
      "# Changelog\n",
    );
  });

  it("cancels locked release when user declines", async () => {
    vi.mocked(releaseModule.detectVersioningStrategy).mockResolvedValue({
      strategy: "locked",
      rootDir: cwd,
      rootVersion: "1.0.0",
      packages: [],
    });
    vi.mocked(releaseModule.getRecommendedBump).mockResolvedValue("minor");

    const result = await runReleaseWorkflow(
      { cwd },
      {
        confirmLockedRelease: () => Promise.resolve(false),
      },
    );

    expect(result.status).toBe("cancelled");
    expect(result.reason).toBe("cancelled-by-user");
    expect(releaseModule.updateAllVersions).not.toHaveBeenCalled();
  });

  it("prepares an independent release with combined notes", async () => {
    vi.mocked(releaseModule.detectVersioningStrategy).mockResolvedValue({
      strategy: "independent",
      rootDir: cwd,
      packages: [
        { name: "pkg1", version: "1.0.0", path: `${cwd}/packages/pkg1` },
      ],
    });
    vi.mocked(releaseModule.findChangedPackages).mockResolvedValue([
      { name: "pkg1", version: "1.0.0", path: `${cwd}/packages/pkg1` },
    ]);
    vi.mocked(releaseModule.determinePackageBumps).mockResolvedValue([
      {
        pkg: { name: "pkg1", version: "1.0.0", path: `${cwd}/packages/pkg1` },
        bumpType: "patch",
        newVersion: "1.0.1",
      },
    ]);
    vi.mocked(releaseModule.updatePackageVersion).mockResolvedValue();
    vi.mocked(releaseModule.performReleaseCommit).mockResolvedValue();
    vi.mocked(releaseModule.generateChangelog).mockImplementation(
      async (_mono, pkgInfo) =>
        pkgInfo ? `Changelog for ${pkgInfo.pkg.name}` : "",
    );
    (mockedFs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue("");

    const displayPlan = vi.fn();
    const confirmPlan = vi.fn().mockResolvedValue(true);

    const result = await runReleaseWorkflow(
      { cwd },
      {
        displayIndependentPlan: displayPlan,
        confirmIndependentRelease: () => confirmPlan(),
      },
    );

    expect(displayPlan).toHaveBeenCalled();
    expect(confirmPlan).toHaveBeenCalled();
    expect(result.status).toBe("prepared");
    expect(result.strategy).toBe("independent");
    expect(result.packages).toHaveLength(1);
    expect(result.releaseNotes).toContain("Changelog for pkg1");
    expect(result.tagName).toBe("pkg1@1.0.1");
    expect(releaseModule.performReleaseCommit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ newVersion: "1.0.1" }),
      ]),
      cwd,
    );
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      `${cwd}/packages/pkg1/CHANGELOG.md`,
      "Changelog for pkg1\n",
    );
  });

  it("returns no changes when independent strategy has nothing to release", async () => {
    vi.mocked(releaseModule.detectVersioningStrategy).mockResolvedValue({
      strategy: "independent",
      rootDir: cwd,
      packages: [],
    });
    vi.mocked(releaseModule.findChangedPackages).mockResolvedValue([]);

    const result = await runReleaseWorkflow({ cwd });

    expect(result.status).toBe("cancelled");
    expect(result.reason).toBe("no-changes");
    expect(releaseModule.determinePackageBumps).not.toHaveBeenCalled();
  });
});