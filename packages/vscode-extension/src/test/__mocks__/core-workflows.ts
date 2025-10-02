/**
 * Mock for @stackcode/core workflows
 * Used in integration tests to verify extension behavior without external dependencies
 */

import type {
  InitWorkflowStep,
  CommitWorkflowStep,
  GenerateWorkflowStep,
  ReleaseWorkflowStep,
  InitWorkflowProgress,
  CommitWorkflowProgress,
  GenerateWorkflowProgress,
  ReleaseWorkflowProgress,
} from "@stackcode/core";

interface MockWorkflowResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Mock implementation of runInitWorkflow
 */
export const runInitWorkflow = jest.fn(
  async (
    options: {
      projectName: string;
      description?: string;
      stack?: string;
      template?: string;
      gitInit?: boolean;
      installDeps?: boolean;
      cwd?: string;
    },
    hooks?: {
      onProgress?: (progress: InitWorkflowProgress) => void | Promise<void>;
    },
  ): Promise<MockWorkflowResult> => {
    // Simulate workflow steps
    const steps: InitWorkflowStep[] = [
      "scaffold",
      "saveConfig",
      "generateReadme",
      "generateGitignore",
      "setupHusky",
      "initializeGit",
      "validateDependencies",
      "installDependencies",
      "completed",
    ];

    for (const step of steps) {
      await hooks?.onProgress?.({ step, message: `Executing ${step}` });
    }

    return {
      success: true,
      data: {
        projectPath: options.cwd || "/test/project",
        filesCreated: ["package.json", "README.md", ".gitignore"],
      },
    };
  },
);

/**
 * Mock implementation of runCommitWorkflow
 */
export const runCommitWorkflow = jest.fn(
  async (
    options: {
      cwd?: string;
      type?: string;
      scope?: string;
      message?: string;
      body?: string;
      breaking?: boolean;
      issueNumber?: string;
    },
    hooks?: {
      onProgress?: (progress: CommitWorkflowProgress) => void | Promise<void>;
    },
  ): Promise<MockWorkflowResult> => {
    const steps: CommitWorkflowStep[] = [
      "checkingStaged",
      "buildingMessage",
      "committing",
      "completed",
    ];

    for (const step of steps) {
      await hooks?.onProgress?.({ step, message: `Executing ${step}` });
    }

    return {
      success: true,
      data: {
        commitHash: "abc123def456",
        message: `${options.type}${options.scope ? `(${options.scope})` : ""}: ${options.message}`,
      },
    };
  },
);

/**
 * Mock implementation of runGenerateWorkflow
 */
export const runGenerateWorkflow = jest.fn(
  async (
    options: {
      type: "readme" | "gitignore" | "contributing" | "license";
      cwd?: string;
      force?: boolean;
    },
    hooks?: {
      onProgress?: (progress: GenerateWorkflowProgress) => void | Promise<void>;
    },
  ): Promise<MockWorkflowResult> => {
    const steps: GenerateWorkflowStep[] = [
      "checkingFile",
      "generatingContent",
      "writingFile",
      "completed",
    ];

    for (const step of steps) {
      await hooks?.onProgress?.({ step });
    }

    return {
      success: true,
      data: {
        filePath: `${options.cwd || "/test/project"}/${options.type === "readme" ? "README.md" : `.${options.type}`}`,
        content: `Mock ${options.type} content`,
      },
    };
  },
);

/**
 * Mock implementation of runReleaseWorkflow
 */
export const runReleaseWorkflow = jest.fn(
  async (
    options: {
      cwd?: string;
      releaseType?: "major" | "minor" | "patch";
      preRelease?: string;
      skipGitTag?: boolean;
      skipGitPush?: boolean;
    },
    hooks?: {
      onProgress?: (progress: ReleaseWorkflowProgress) => void | Promise<void>;
    },
  ): Promise<MockWorkflowResult> => {
    const steps: ReleaseWorkflowStep[] = [
      "detectingStrategy",
      "lockedRecommendedBump",
      "lockedUpdatingVersions",
      "lockedGeneratingChangelog",
      "independentFindingChanges",
      "independentDeterminingBumps",
      "independentPreparingPlan",
      "independentUpdatingPackages",
      "independentCommitting",
      "completed",
    ];

    for (const step of steps) {
      await hooks?.onProgress?.({ step, message: `Executing ${step}` });
    }

    return {
      success: true,
      data: {
        version: "1.2.3",
        tag: "v1.2.3",
        changelog: "## [1.2.3] - 2025-10-02\n\n### Features\n- Mock feature",
      },
    };
  },
);

/**
 * Mock implementation of runIssuesWorkflow
 */
export const runIssuesWorkflow = jest.fn(
  async (options: {
    owner: string;
    repo: string;
    token: string;
    state?: "open" | "closed" | "all";
  }): Promise<MockWorkflowResult> => {
    return {
      success: true,
      data: {
        issues: [
          {
            number: 1,
            title: "Test Issue",
            state: "open",
            labels: ["bug"],
            created_at: "2025-10-01T00:00:00Z",
          },
        ],
      },
    };
  },
);

/**
 * Mock implementation of validateProjectStructure
 */
export const validateProjectStructure = jest.fn(
  async (cwd: string): Promise<{ isValid: boolean; errors: string[] }> => {
    return {
      isValid: true,
      errors: [],
    };
  },
);

/**
 * Mock implementation of validateCommitMessage
 */
export const validateCommitMessage = jest.fn(
  (message: string): { isValid: boolean; errors: string[] } => {
    const conventionalPattern =
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,}/;
    const isValid = conventionalPattern.test(message);

    return {
      isValid,
      errors: isValid
        ? []
        : ["Message does not follow conventional commits format"],
    };
  },
);

/**
 * Mock implementation of clearRepositoryCache
 */
export const clearRepositoryCache = jest.fn(async (): Promise<void> => {
  // No-op for mock
});

/**
 * Mock implementation of saveStackCodeConfig
 */
export const saveStackCodeConfig = jest.fn(
  async (cwd: string, config: Record<string, unknown>): Promise<void> => {
    // No-op for mock
  },
);
