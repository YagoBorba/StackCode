import React, { useState, useEffect } from "react";
import {
  Rocket,
  Zap,
  GitBranch,
  Star,
  Package,
  GitCommit,
  FolderOpen,
  Book,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import IssuesPanel from "./IssuesPanel";
import ProgressIndicator from "./ProgressIndicator";
import { useProgress } from "../hooks/useProgress";

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

interface VsCodeApi {
  postMessage(message: { type: string; payload?: unknown }): void;
}

interface DashboardProps {
  vscode?: VsCodeApi;
  currentBranch?: string;
  hasChanges?: boolean;
  issues?: IssuesState;
  stats?: ProjectStats;
  onRefreshIssues?: () => void;
  onLogin?: () => void;
}

interface ProjectStats {
  files: number;
  branches: number;
  commits: number;
  issues: number;
  contributors: number;
  linesOfCode: number;
  stars?: number;
  forks?: number;
  watchers?: number;
  defaultBranch?: string;
  isPrivate?: boolean;
  needsAuth?: boolean;
  error?: string;
  recentActivity?: {
    thisWeek?: number;
    thisMonth?: number;
    lastPush?: string;
  };
}

interface ActivityItem {
  id: string;
  type: "commit" | "branch" | "file" | "release";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({
  vscode,
  issues,
  stats: propStats,
  onRefreshIssues,
  onLogin,
}) => {
  const stats = propStats || {
    files: 0,
    branches: 0,
    commits: 0,
    issues: 0,
    contributors: 0,
    linesOfCode: 0,
    needsAuth: false,
  };

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const items: ActivityItem[] = [];
    if (stats?.commits) {
      items.push({
        id: "commit-week",
        type: "commit",
        title: `${stats.commits} commits (approx)`,
        description: "Total commits on repository",
        timestamp: new Date().toISOString(),
        icon: <GitCommit className="w-5 h-5" />,
      });
    }
    if (stats?.recentActivity?.thisWeek !== undefined) {
      items.push({
        id: "week-commits",
        type: "commit",
        title: `${stats.recentActivity.thisWeek} commits this week`,
        description: "Recent weekly activity",
        timestamp: new Date().toISOString(),
        icon: <Activity className="w-5 h-5" />,
      });
    }
    if (stats?.recentActivity?.thisMonth !== undefined) {
      items.push({
        id: "month-commits",
        type: "commit",
        title: `${stats.recentActivity.thisMonth} commits this month`,
        description: "Recent monthly activity",
        timestamp: new Date().toISOString(),
        icon: <Activity className="w-5 h-5" />,
      });
    }
  const lastPush = stats?.recentActivity?.lastPush;
    if (lastPush) {
      items.push({
        id: "last-push",
        type: "commit",
        title: "Last push",
        description: new Date(lastPush).toLocaleString(),
        timestamp: lastPush,
        icon: <Activity className="w-5 h-5" />,
      });
    }
    setActivities(items);
  }, [stats]);

  const sendMessage = (type: string) => {
    if (vscode) {
      vscode.postMessage({ type });
    }
  };

  const quickActions = [
    {
      id: "stackcode.init",
      title: "Initialize Project",
      description: "Set up StackCode scaffolding",
      icon: <FolderOpen className="w-6 h-6" />,
      iconColor: "text-blue-400",
      onClick: () => sendMessage("stackcode.init"),
    },
    {
      id: "stackcode.generate.readme",
      title: "Generate README",
      description: "Create comprehensive docs",
      icon: <Book className="w-6 h-6" />,
      iconColor: "text-green-400",
      onClick: () => sendMessage("stackcode.generate.readme"),
    },
    {
      id: "stackcode.git.start",
      title: "Start Feature",
      description: "Begin new development",
      icon: <GitBranch className="w-6 h-6" />,
      iconColor: "text-purple-400",
      onClick: () => sendMessage("stackcode.git.start"),
    },
    {
      id: "stackcode.commit",
      title: "Smart Commit",
      description: "Conventional commits",
      icon: <GitCommit className="w-6 h-6" />,
      iconColor: "text-orange-400",
      onClick: () => sendMessage("stackcode.commit"),
    },
    {
      id: "stackcode.validate",
      title: "Validate Project",
      description: "Check best practices",
      icon: <Shield className="w-6 h-6" />,
      iconColor: "text-red-400",
      onClick: () => sendMessage("stackcode.validate"),
    },
    {
      id: "stackcode.release",
      title: "Create Release",
      description: "Package and deploy",
      icon: <Rocket className="w-6 h-6" />,
      iconColor: "text-indigo-400",
      onClick: () => sendMessage("stackcode.release"),
    },
  ];

  const tips = [
    {
      title: "🚀 Quick Start",
      description:
        'Use Ctrl+Shift+P and type "StackCode" to access all commands quickly!',
    },
    {
      title: "🔄 Auto Monitor",
      description:
        "The extension automatically monitors your files and suggests improvements.",
    },
    {
      title: "🎯 Git Flow",
      description:
        "Follow best practices with automated feature, hotfix, and release workflows.",
    },
    {
      title: "📊 Analytics",
      description:
        "Track your development progress with built-in project analytics.",
    },
  ];

  const progressState = useProgress();

  useEffect(() => {
    const animateNumbers = () => {
      const elements = document.querySelectorAll(".animate-number");
      elements.forEach((el) => {
        const target = parseInt(el.textContent || "0");
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target.toString();
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current).toString();
          }
        }, 50);
      });
    };

    setTimeout(animateNumbers, 100);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      <ProgressIndicator {...progressState} />

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-12 h-12" style={{ color: '#ffffff' }} />
            <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>
              StackCode
            </h1>
          </div>
          <p className="text-xl text-blue-100 font-light">
            Your Complete Development Assistant
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto mb-4">
        <div className="bg-blue-900/60 border border-blue-700 rounded-xl p-3 text-center text-blue-200 text-xs">
          <strong>Info:</strong> O tamanho da barra lateral do VS Code é ajustado manualmente pelo usuário. Para alterar a largura, arraste a divisória do painel lateral.
        </div>
      </div>


      {stats.needsAuth && (
        <div className="w-full px-4 sm:px-6 py-6">
          <div className="bg-gradient-to-br from-blue-700 via-purple-700 to-blue-900 border-2 border-blue-800 rounded-2xl p-8 text-center shadow-xl flex flex-col items-center justify-center">
            <Shield className="w-16 h-16 mb-4 text-white drop-shadow-lg" />
            <h2 className="text-3xl font-extrabold mb-2 text-white">Conecte ao GitHub</h2>
            <p className="text-blue-100 mb-6 text-base max-w-md mx-auto">
              Para liberar estatísticas, issues e recursos avançados, conecte sua conta do GitHub.
            </p>
            <button
              onClick={() => vscode?.postMessage({ type: 'connectGitHub' })}
              className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-lg shadow hover:bg-blue-50 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-700" />
                Conectar ao GitHub
              </span>
            </button>
            <div className="mt-6 text-xs text-blue-200 opacity-80">Suas credenciais são protegidas pelo VS Code.</div>
          </div>
        </div>
      )}

      {/* Espaçamento extra entre o card de login e os cards abaixo */}
      {stats.needsAuth && <div className="h-8" />}

  <div className="w-full px-4 sm:px-6 py-4 sm:py-6 space-y-8" style={{maxWidth: 'var(--stackcode-main-max-width)', margin: '0 auto'}}>


        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: "Stars",
              value: stats.stars ?? 0,
              icon: <Star className="w-5 h-5" />,
              color: "text-yellow-400",
              needsAuth: true,
            },
            {
              label: "Forks",
              value: stats.forks ?? 0,
              icon: <Package className="w-5 h-5" />,
              color: "text-emerald-400",
              needsAuth: true,
            },
            {
              label: "Watchers",
              value: stats.watchers ?? 0,
              icon: <Activity className="w-5 h-5" />,
              color: "text-cyan-400",
              needsAuth: true,
            },
            {
              label: "Branches",
              value: stats.branches,
              icon: <GitBranch className="w-5 h-5" />,
              color: "text-green-400",
              needsAuth: true,
            },
            {
              label: "Commits",
              value: stats.commits,
              icon: <GitCommit className="w-5 h-5" />,
              color: "text-purple-400",
              needsAuth: true,
            },
            {
              label: "Issues",
              value: stats.issues,
              icon: <Shield className="w-5 h-5" />,
              color: "text-red-400",
              needsAuth: true,
            },
          ].map((stat, index) => {
            const isBlurred = stats.needsAuth && stat.needsAuth;
            return (
              <div
                key={index}
                className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 relative transition-all duration-300 hover:scale-105 ${isBlurred ? 'card-blur pointer-events-none' : 'backdrop-blur-sm hover:bg-slate-800/70'}`}
                style={isBlurred ? { filter: 'blur(3px)', opacity: 0.7 } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color}`}>{stat.icon}</div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold animate-number">
                  {isBlurred ? 0 : stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          <div className="lg:col-span-2">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className="quick-action-button group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="relative z-10">
                      <div className={`flex items-center justify-center mb-3 ${action.iconColor}`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs opacity-80">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>



          <div className={stats.needsAuth ? 'card-blur' : ''} style={stats.needsAuth ? { filter: 'blur(3px)', opacity: 0.7 } : {}}>
            {issues && onRefreshIssues && onLogin && (
              <IssuesPanel
                issuesState={issues}
                onRefresh={onRefreshIssues}
                onLogin={onLogin}
                vscode={vscode}
              />
            )}
          </div>


          <div className={`relative ${stats.needsAuth ? 'card-blur' : ''}`} style={stats.needsAuth ? { filter: 'blur(3px)', opacity: 0.7 } : {}}>
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>Recent Activity</h2>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {activity.description}
                      </p>
                      <span className="text-xs text-slate-500 mt-2 block">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>Pro Tips</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 rounded-xl p-4 hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300"
              >
                <h3 className="font-semibold text-sm mb-2">{tip.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
