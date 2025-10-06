import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ProjectView from "./components/ProjectView";
import StatusBar from "./components/StatusBar";
import NotificationPanel from "./components/NotificationPanel";
import CommandPalette from "./components/CommandPalette";

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
    description: string | null;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface IssuesState {
  issues: GitHubIssue[];
  loading: boolean;
  error: string | null;
  needsAuth: boolean;
  timestamp?: string;
}

const mockVSCode = {
  postMessage: (message: { type: string; payload?: unknown }) => {
    console.log("VSCode message:", message);
  },
};

interface VsCodeApi {
  postMessage(message: { type: string; payload?: unknown }): void;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VsCodeApi;
  }
}

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

const initialStats = {
  files: 0,
  branches: 0,
  commits: 0,
  issues: 0,
  contributors: 0,
  linesOfCode: 0,
  needsAuth: false,
};

const initialIssuesState: IssuesState = {
  issues: [],
  loading: false,
  error: null,
  needsAuth: false,
};

function App() {
  const [currentView] = useState<"dashboard" | "project">("dashboard");
  const [viewMode] = useState<"compact" | "sidebar" | "full">("full");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "tip",
      title: "Welcome to StackCode!",
      message:
        "Get started by initializing your project or exploring the dashboard.",
      actions: [
        { label: "Initialize", action: "stackcode.init", primary: true },
        { label: "Learn More", action: "stackcode.config" },
      ],
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== "1"));
    }, 12000); // 12 segundos para dar mais tempo de leitura

    return () => clearTimeout(timer);
  }, []);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [hasChanges, setHasChanges] = useState(false);
  const [lastAction, setLastAction] = useState("Ready");
  const [stats, setStats] = useState(initialStats);
  const [isReady, setIsReady] = useState(false);
  const [issuesState, setIssuesState] =
    useState<IssuesState>(initialIssuesState);
  const [vscode] = useState(() => {
    return typeof window !== "undefined" && "acquireVsCodeApi" in window
      ? (window as { acquireVsCodeApi: () => VsCodeApi }).acquireVsCodeApi()
      : mockVSCode;
  });

  const [hideSidebarHint, setHideSidebarHint] = useState<boolean>(() => {
    try {
      return localStorage.getItem('stackcode_hideSidebarHint') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (hideSidebarHint) return;

    const showHint = () => {
      const hint: Notification = {
        id: `sidebar-hint-${Date.now()}`,
        type: "tip",
        title: "Tip: Expand the View",
        message:
          "To see all content, drag the VS Code sidebar boundary to the right. Panel size is controlled by the editor.",
        actions: [
          { label: "OK", action: "ui.sidebarHint.ok", primary: true },
          { label: "Don't remind", action: "ui.sidebarHint.never" },
        ],
        timestamp: new Date(),
      };
      setNotifications((prev) => [hint, ...prev]);
    };

  const initialTimer = setTimeout(showHint, 20000);
  const interval = setInterval(showHint, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [hideSidebarHint]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "updateStats":
          setStats((prevStats) => ({ ...prevStats, ...message.payload }));
          setIsReady(true);
          break;
        case "updateBranch":
          setCurrentBranch(message.payload?.branch || "main");
          break;
        case "updateChanges":
          setHasChanges(message.payload?.hasChanges || false);
          break;
        case "updateIssues":
          setIssuesState({
            issues: message.payload?.issues || [],
            loading: false,
            error: message.payload?.error || null,
            needsAuth: message.payload?.needsAuth || false,
            timestamp: message.payload?.timestamp,
          });
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    vscode.postMessage({ type: "webviewReady" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [vscode]);

  const handleCommand = (command: string) => {
    setLastAction(`Executed: ${command}`);

    vscode.postMessage({ type: command });

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "success",
      title: "Command Executed",
      message: `Successfully executed: ${command}`,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleNotificationDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationAction = (action: string) => {
    if (action === 'ui.sidebarHint.ok') {
      return;
    }
    if (action === 'ui.sidebarHint.never') {
      setHideSidebarHint(true);
  try { localStorage.setItem('stackcode_hideSidebarHint', 'true'); } catch {}
      return;
    }
    handleCommand(action);
  };

  if (!isReady) {
    return (
      <div className="bg-slate-900 text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Initializing StackCode Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-900 text-white overflow-hidden" style={{height: '100vh'}}>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Sidebar - Project View */}
        <div className={`border-r border-slate-700 flex-shrink-0 h-full overflow-hidden flex flex-col ${
          viewMode === "sidebar" ? "w-full" : ""
        } ${viewMode === "compact" ? "hidden" : ""}`} style={{ width: viewMode === 'sidebar' ? '100%' : 'var(--stackcode-sidebar-width)' }}>
          <ProjectView onCommand={handleCommand} />
        </div>

        {/* Main Panel - Dashboard */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden w-0 h-full ${
          viewMode === "sidebar" ? "hidden" : ""}`}>
            {currentView === "dashboard" ? (
            <Dashboard
              vscode={vscode}
              currentBranch={currentBranch}
              hasChanges={hasChanges}
              issues={issuesState}
              stats={stats}
              onRefreshIssues={() => {
                setIssuesState((prev) => ({ ...prev, loading: true }));
                vscode.postMessage({ type: "refreshIssues" });
              }}
              onLogin={() =>
                vscode.postMessage({ type: "stackcode.auth.login" })
              }
            />
          ) : (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Project View</h1>
              <p className="text-slate-400">
                Project details and management tools will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        currentBranch={currentBranch}
        hasChanges={hasChanges}
        lastAction={lastAction}
      />

      {/* Notifications */}
      <NotificationPanel
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />
    </div>
  );
}

export default App;
