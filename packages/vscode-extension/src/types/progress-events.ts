/**
 * @fileoverview Centralized progress event types for webview communication
 * Ensures type-safe progress reporting across all workflows
 */

import type {
  CommitWorkflowStep,
  ReleaseWorkflowStep,
  IssuesWorkflowStep,
  InitWorkflowStep,
  GenerateWorkflowStep,
} from "@stackcode/core";

/**
 * Base interface for all progress events
 */
export interface BaseProgressEvent {
  /** Unique identifier for this progress event */
  id: string;
  /** Timestamp when the event occurred */
  timestamp: string;
  /** Optional data associated with the event */
  data?: Record<string, unknown>;
}

/**
 * Progress event for commit workflow
 */
export interface CommitProgressEvent extends BaseProgressEvent {
  type: "commit";
  step: CommitWorkflowStep;
  message?: string;
}

/**
 * Progress event for release workflow
 */
export interface ReleaseProgressEvent extends BaseProgressEvent {
  type: "release";
  step: ReleaseWorkflowStep;
  message?: string;
}

/**
 * Progress event for issues workflow
 */
export interface IssuesProgressEvent extends BaseProgressEvent {
  type: "issues";
  step: IssuesWorkflowStep;
  message?: string;
}

/**
 * Progress event for init workflow
 */
export interface InitProgressEvent extends BaseProgressEvent {
  type: "init";
  step: InitWorkflowStep;
  message?: string;
}

/**
 * Progress event for generate workflow
 */
export interface GenerateProgressEvent extends BaseProgressEvent {
  type: "generate";
  step: GenerateWorkflowStep;
  message?: string;
}

/**
 * Union type of all progress events
 */
export type ProgressEvent =
  | CommitProgressEvent
  | ReleaseProgressEvent
  | IssuesProgressEvent
  | InitProgressEvent
  | GenerateProgressEvent;

/**
 * Progress state for UI rendering
 */
export interface ProgressState {
  /** Whether the workflow is currently in progress */
  inProgress: boolean;
  /** Current workflow type */
  workflowType?: ProgressEvent["type"];
  /** Current step */
  currentStep?: string;
  /** Progress message to display */
  message?: string;
  /** Progress percentage (0-100) */
  percentage?: number;
  /** Error message if workflow failed */
  error?: string;
}

/**
 * Message types sent from extension to webview
 */
export interface WebviewProgressMessage {
  type: "progress";
  payload: ProgressEvent;
}

export interface WebviewProgressStateMessage {
  type: "progressState";
  payload: ProgressState;
}

export interface WebviewProgressCompleteMessage {
  type: "progressComplete";
  payload: {
    workflowType: ProgressEvent["type"];
    success: boolean;
    message?: string;
    error?: string;
  };
}

/**
 * Helper to create a progress event
 */
export function createProgressEvent<T extends ProgressEvent["type"]>(
  type: T,
  step: string,
  message?: string,
  data?: Record<string, unknown>,
): ProgressEvent {
  return {
    type,
    step,
    message,
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    data,
  } as ProgressEvent;
}

/**
 * Helper to calculate progress percentage based on workflow steps
 */
export function calculateProgressPercentage(
  workflowType: ProgressEvent["type"],
  currentStep: string,
): number {
  const stepMaps: Record<ProgressEvent["type"], Record<string, number>> = {
    commit: {
      checkingStaged: 25,
      buildingMessage: 50,
      committing: 75,
      completed: 100,
    },
    release: {
      detectingStrategy: 10,
      lockedRecommendedBump: 20,
      lockedUpdatingVersions: 40,
      lockedGeneratingChangelog: 60,
      independentFindingChanges: 20,
      independentDeterminingBumps: 40,
      independentPreparingPlan: 60,
      independentUpdatingPackages: 80,
      independentCommitting: 90,
      completed: 100,
    },
    issues: {
      fetching: 50,
      caching: 75,
      completed: 100,
      error: 100,
    },
    init: {
      scaffold: 15,
      saveConfig: 25,
      generateReadme: 35,
      generateGitignore: 45,
      setupHusky: 55,
      initializeGit: 65,
      validateDependencies: 75,
      installDependencies: 90,
      completed: 100,
    },
    generate: {
      checkingFile: 33,
      generatingContent: 66,
      writingFile: 90,
      completed: 100,
    },
  };

  return stepMaps[workflowType]?.[currentStep] ?? 0;
}

/**
 * Helper to get user-friendly step descriptions
 */
export function getStepDescription(
  workflowType: ProgressEvent["type"],
  step: string,
): string {
  const descriptions: Record<ProgressEvent["type"], Record<string, string>> = {
    commit: {
      checkingStaged: "Checking staged changes...",
      buildingMessage: "Building commit message...",
      committing: "Creating commit...",
      completed: "Commit completed successfully",
    },
    release: {
      detectingStrategy: "Detecting versioning strategy...",
      lockedRecommendedBump: "Determining version bump...",
      lockedUpdatingVersions: "Updating versions...",
      lockedGeneratingChangelog: "Generating changelog...",
      independentFindingChanges: "Finding changed packages...",
      independentDeterminingBumps: "Determining version bumps...",
      independentPreparingPlan: "Preparing release plan...",
      independentUpdatingPackages: "Updating package versions...",
      independentCommitting: "Creating release commits...",
      completed: "Release workflow completed",
    },
    issues: {
      fetching: "Fetching issues from GitHub...",
      caching: "Caching results...",
      completed: "Issues fetched successfully",
      error: "Failed to fetch issues",
    },
    init: {
      scaffold: "Scaffolding project structure...",
      saveConfig: "Saving configuration...",
      generateReadme: "Generating README...",
      generateGitignore: "Generating .gitignore...",
      setupHusky: "Setting up Husky...",
      initializeGit: "Initializing Git repository...",
      validateDependencies: "Validating dependencies...",
      installDependencies: "Installing dependencies...",
      completed: "Project initialized successfully",
    },
    generate: {
      checkingFile: "Checking existing file...",
      generatingContent: "Generating content...",
      writingFile: "Writing file...",
      completed: "File generated successfully",
    },
  };

  return descriptions[workflowType]?.[step] ?? `Processing: ${step}`;
}
