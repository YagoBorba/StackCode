"use strict";
/**
 * @fileoverview Centralized progress manager for workflow events
 * Manages progress state and broadcasts to webview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressManager = void 0;
const progress_events_1 = require("../types/progress-events");
/**
 * Manages workflow progress events and broadcasts to webviews
 */
class ProgressManager {
    constructor() {
        this._disposables = [];
        this._currentState = { inProgress: false };
        this._webviewProviders = new Set();
    }
    /**
     * Register a webview provider to receive progress updates
     */
    registerWebviewProvider(provider) {
        this._webviewProviders.add(provider);
    }
    /**
     * Unregister a webview provider
     */
    unregisterWebviewProvider(provider) {
        this._webviewProviders.delete(provider);
    }
    /**
     * Start a new workflow progress session
     */
    startWorkflow(workflowType) {
        this._currentState = {
            inProgress: true,
            workflowType,
            currentStep: undefined,
            message: `Starting ${workflowType} workflow...`,
            percentage: 0,
        };
        this._broadcastState();
    }
    /**
     * Report progress for a workflow step
     */
    reportProgress(workflowType, step, customMessage, data) {
        const event = (0, progress_events_1.createProgressEvent)(workflowType, step, customMessage, data);
        const percentage = (0, progress_events_1.calculateProgressPercentage)(workflowType, step);
        const message = customMessage || (0, progress_events_1.getStepDescription)(workflowType, step);
        this._currentState = {
            inProgress: true,
            workflowType,
            currentStep: step,
            message,
            percentage,
        };
        // Broadcast to webviews
        this._broadcastProgress(event);
        this._broadcastState();
        // Update VS Code progress reporter if available
        if (this._progressReporter) {
            const increment = percentage - (this._currentState.percentage || 0);
            this._progressReporter.report({
                message,
                increment: increment > 0 ? increment : undefined,
            });
        }
    }
    /**
     * Complete a workflow (success)
     */
    completeWorkflow(workflowType, message) {
        this._currentState = {
            inProgress: false,
            workflowType,
            message: message || `${workflowType} workflow completed successfully`,
            percentage: 100,
        };
        this._broadcastComplete({
            workflowType,
            success: true,
            message,
        });
        this._broadcastState();
        // Reset after a short delay
        setTimeout(() => {
            if (!this._currentState.inProgress) {
                this._currentState = { inProgress: false };
                this._broadcastState();
            }
        }, 3000);
    }
    /**
     * Fail a workflow (error)
     */
    failWorkflow(workflowType, error) {
        this._currentState = {
            inProgress: false,
            workflowType,
            message: `${workflowType} workflow failed`,
            error,
            percentage: 0,
        };
        this._broadcastComplete({
            workflowType,
            success: false,
            error,
        });
        this._broadcastState();
    }
    /**
     * Get current progress state
     */
    getCurrentState() {
        return { ...this._currentState };
    }
    /**
     * Create a progress hook for use with core workflows
     */
    createProgressHook(workflowType) {
        return (progress) => {
            this.reportProgress(workflowType, progress.step, progress.message);
        };
    }
    /**
     * Set the VS Code progress reporter (from withProgress)
     */
    setVSCodeProgressReporter(reporter) {
        this._progressReporter = reporter;
    }
    /**
     * Clear the VS Code progress reporter
     */
    clearVSCodeProgressReporter() {
        this._progressReporter = undefined;
    }
    /**
     * Broadcast progress event to all registered webviews
     */
    _broadcastProgress(event) {
        const message = {
            type: "progress",
            payload: event,
        };
        for (const provider of this._webviewProviders) {
            provider.sendMessage(message);
        }
    }
    /**
     * Broadcast state update to all registered webviews
     */
    _broadcastState() {
        const message = {
            type: "progressState",
            payload: this._currentState,
        };
        for (const provider of this._webviewProviders) {
            provider.sendMessage(message);
        }
    }
    /**
     * Broadcast completion message to all registered webviews
     */
    _broadcastComplete(payload) {
        const message = {
            type: "progressComplete",
            payload,
        };
        for (const provider of this._webviewProviders) {
            provider.sendMessage(message);
        }
    }
    dispose() {
        this._webviewProviders.clear();
        this._disposables.forEach((d) => d.dispose());
        this._disposables = [];
    }
}
exports.ProgressManager = ProgressManager;
//# sourceMappingURL=ProgressManager.js.map