/**
 * @fileoverview Centralized progress manager for workflow events
 * Manages progress state and broadcasts to webview
 */

import * as vscode from "vscode";
import type {
  ProgressEvent,
  ProgressState,
  WebviewProgressMessage,
  WebviewProgressStateMessage,
  WebviewProgressCompleteMessage,
} from "../types/progress-events";
import {
  createProgressEvent,
  calculateProgressPercentage,
  getStepDescription,
} from "../types/progress-events";

/**
 * Manages workflow progress events and broadcasts to webviews
 */
export class ProgressManager implements vscode.Disposable {
  private _disposables: vscode.Disposable[] = [];
  private _currentState: ProgressState = { inProgress: false };
  private _webviewProviders: Set<WebviewProgressListener> = new Set();
  private _progressReporter?: vscode.Progress<{
    message?: string;
    increment?: number;
  }>;

  /**
   * Register a webview provider to receive progress updates
   */
  public registerWebviewProvider(provider: WebviewProgressListener): void {
    this._webviewProviders.add(provider);
  }

  /**
   * Unregister a webview provider
   */
  public unregisterWebviewProvider(provider: WebviewProgressListener): void {
    this._webviewProviders.delete(provider);
  }

  /**
   * Start a new workflow progress session
   */
  public startWorkflow(workflowType: ProgressEvent["type"]): void {
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
  public reportProgress(
    workflowType: ProgressEvent["type"],
    step: string,
    customMessage?: string,
    data?: Record<string, unknown>,
  ): void {
    const event = createProgressEvent(workflowType, step, customMessage, data);
    const percentage = calculateProgressPercentage(workflowType, step);
    const message = customMessage || getStepDescription(workflowType, step);

    this._currentState = {
      inProgress: true,
      workflowType,
      currentStep: step,
      message,
      percentage,
    };

    this._broadcastProgress(event);
    this._broadcastState();

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
  public completeWorkflow(
    workflowType: ProgressEvent["type"],
    message?: string,
  ): void {
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
  public failWorkflow(
    workflowType: ProgressEvent["type"],
    error: string,
  ): void {
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
  public getCurrentState(): ProgressState {
    return { ...this._currentState };
  }

  /**
   * Create a progress hook for use with core workflows
   */
  public createProgressHook<T extends ProgressEvent["type"]>(
    workflowType: T,
  ): (progress: { step: string; message?: string }) => void {
    return (progress) => {
      this.reportProgress(workflowType, progress.step, progress.message);
    };
  }

  /**
   * Set the VS Code progress reporter (from withProgress)
   */
  public setVSCodeProgressReporter(
    reporter: vscode.Progress<{ message?: string; increment?: number }>,
  ): void {
    this._progressReporter = reporter;
  }

  /**
   * Clear the VS Code progress reporter
   */
  public clearVSCodeProgressReporter(): void {
    this._progressReporter = undefined;
  }

  /**
   * Broadcast progress event to all registered webviews
   */
  private _broadcastProgress(event: ProgressEvent): void {
    const message: WebviewProgressMessage = {
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
  private _broadcastState(): void {
    const message: WebviewProgressStateMessage = {
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
  private _broadcastComplete(
    payload: WebviewProgressCompleteMessage["payload"],
  ): void {
    const message: WebviewProgressCompleteMessage = {
      type: "progressComplete",
      payload,
    };

    for (const provider of this._webviewProviders) {
      provider.sendMessage(message);
    }
  }

  public dispose(): void {
    this._webviewProviders.clear();
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
}

/**
 * Interface that webview providers must implement to receive progress updates
 */
export interface WebviewProgressListener {
  sendMessage(
    message:
      | WebviewProgressMessage
      | WebviewProgressStateMessage
      | WebviewProgressCompleteMessage,
  ): void;
}
