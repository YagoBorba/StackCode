import React from "react";
import { Loader2, CheckCircle, XCircle, Activity } from "lucide-react";

interface ProgressIndicatorProps {
  inProgress: boolean;
  workflowType?: "commit" | "release" | "issues" | "init" | "generate";
  currentStep?: string;
  message?: string;
  percentage?: number;
  error?: string;
}

const workflowIcons: Record<string, React.ReactNode> = {
  commit: <Activity className="w-4 h-4" />,
  release: <Activity className="w-4 h-4" />,
  issues: <Activity className="w-4 h-4" />,
  init: <Activity className="w-4 h-4" />,
  generate: <Activity className="w-4 h-4" />,
};

const workflowLabels: Record<string, string> = {
  commit: "Commit",
  release: "Release",
  issues: "Issues",
  init: "Initialize",
  generate: "Generate",
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  inProgress,
  workflowType,
  currentStep,
  message,
  percentage = 0,
  error,
}) => {
  if (!inProgress && !error) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 
        bg-slate-800 border rounded-lg shadow-lg 
        min-w-[320px] max-w-[400px]
        transition-all duration-300 ease-in-out
        ${error ? "border-red-500" : "border-blue-500"}
      `}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {error ? (
            <XCircle className="w-4 h-4 text-red-400" />
          ) : inProgress ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          <span className="text-sm font-semibold text-white">
            {workflowType ? workflowLabels[workflowType] : "Processing"}
          </span>
        </div>
        {workflowType && (
          <span className="text-xs text-slate-400">
            {workflowIcons[workflowType]}
          </span>
        )}
      </div>

      <div className="p-3">
        {message && <p className="text-sm text-slate-300 mb-2">{message}</p>}

        {currentStep && !error && (
          <p className="text-xs text-slate-400 mb-2">
            Step: <span className="text-slate-300">{currentStep}</span>
          </p>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded p-2 mb-2">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {inProgress && !error && (
          <div className="relative">
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">
              {percentage}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
