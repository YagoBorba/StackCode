import { useState, useEffect } from "react";

/**
 * Progress state interface matching the extension-side types
 */
interface ProgressState {
  inProgress: boolean;
  workflowType?: "commit" | "release" | "issues" | "init" | "generate";
  currentStep?: string;
  message?: string;
  percentage?: number;
  error?: string;
}

/**
 * Progress event from extension
 */
interface ProgressEvent {
  type: "commit" | "release" | "issues" | "init" | "generate";
  step: string;
  message?: string;
  id: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Message types from extension
 */
interface ProgressMessage {
  type: "progress";
  payload: ProgressEvent;
}

interface ProgressStateMessage {
  type: "progressState";
  payload: ProgressState;
}

interface ProgressCompleteMessage {
  type: "progressComplete";
  payload: {
    workflowType: ProgressEvent["type"];
    success: boolean;
    message?: string;
    error?: string;
  };
}

type VSCodeMessage = ProgressMessage | ProgressStateMessage | ProgressCompleteMessage;

/**
 * Custom hook to manage progress state from VS Code extension
 */
export function useProgress() {
  const [progressState, setProgressState] = useState<ProgressState>({
    inProgress: false,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as VSCodeMessage;

      switch (message.type) {
        case "progress":
          // Individual progress event (less common, mainly for logging)
          console.log("[WebviewUI] Progress event:", message.payload);
          break;

        case "progressState":
          // Full state update (primary mechanism)
          setProgressState(message.payload);
          break;

        case "progressComplete":
          // Workflow completed (success or failure)
          if (message.payload.success) {
            setProgressState({
              inProgress: false,
              workflowType: message.payload.workflowType,
              message: message.payload.message || "Completed successfully",
              percentage: 100,
            });
          } else {
            setProgressState({
              inProgress: false,
              workflowType: message.payload.workflowType,
              error: message.payload.error || "An error occurred",
              percentage: 0,
            });
          }

          // Clear after a delay
          setTimeout(() => {
            setProgressState({ inProgress: false });
          }, 5000);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return progressState;
}
