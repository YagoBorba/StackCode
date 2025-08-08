import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success" | "tip";
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  timestamp: Date;
  dismissed?: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction: (action: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onDismiss,
  onAction,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([]);

  useEffect(() => {
    setVisibleNotifications(notifications.filter((n) => !n.dismissed));
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-400";
      case "warning":
        return "border-l-yellow-400";
      case "error":
        return "border-l-red-400";
      case "tip":
        return "border-l-blue-400";
      default:
        return "border-l-slate-400";
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
    onDismiss(id);
  };

  const handleAction = (action: string, notificationId: string) => {
    onAction(action);
    handleDismiss(notificationId);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-slate-800 border-l-4 ${getNotificationBorder(notification.type)} rounded-lg shadow-lg p-4 animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {notification.message}
              </p>

              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleAction(action.action, notification.id)
                      }
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        action.primary
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-500 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
