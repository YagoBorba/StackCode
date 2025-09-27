import React, { useState, useEffect } from "react";
import {
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";

interface StatusBarProps {
  currentBranch?: string;
  hasChanges?: boolean;
  lastAction?: string;
  onQuickAction?: (action: string) => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  currentBranch = "main",
  hasChanges = false,
  lastAction = "Ready",
  onQuickAction,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    if (hasChanges) return "text-yellow-400";
    if (currentBranch === "main" || currentBranch === "master")
      return "text-red-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (hasChanges) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        {/* Git Status */}
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          <GitBranch className="w-4 h-4" />
          <span>{currentBranch}</span>
          {getStatusIcon()}
        </div>

        {/* Last Action */}
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4" />
          <span>{lastAction}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <button
          onClick={() => onQuickAction?.("stackcode.commit")}
          className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xs"
        >
          <Zap className="w-3 h-3" />
          Quick Commit
        </button>

        {/* Time */}
        <div className="text-slate-400">{time.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default StatusBar;
