"use strict";
/**
 * @fileoverview Centralized progress event types for webview communication
 * Ensures type-safe progress reporting across all workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStepDescription = exports.calculateProgressPercentage = exports.createProgressEvent = void 0;
/**
 * Helper to create a progress event
 */
function createProgressEvent(type, step, message, data) {
    return {
        type,
        step,
        message,
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        data,
    };
}
exports.createProgressEvent = createProgressEvent;
/**
 * Helper to calculate progress percentage based on workflow steps
 */
function calculateProgressPercentage(workflowType, currentStep) {
    const stepMaps = {
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
exports.calculateProgressPercentage = calculateProgressPercentage;
/**
 * Helper to get user-friendly step descriptions
 */
function getStepDescription(workflowType, step) {
    const descriptions = {
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
exports.getStepDescription = getStepDescription;
//# sourceMappingURL=progress-events.js.map