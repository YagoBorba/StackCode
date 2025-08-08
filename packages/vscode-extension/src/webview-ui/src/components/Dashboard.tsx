import React, { useState, useEffect } from "react";
import {
  Rocket,
  Zap,
  GitBranch,
  FileText,
  CheckCircle,
  Star,
  Package,
  GitCommit,
  FolderOpen,
  Book,
  Shield,
  TrendingUp,
  Activity,
  Users,
  Code,
} from "lucide-react";

interface DashboardProps {
  vscode?: {
    postMessage: (message: { type: string; payload?: unknown }) => void;
  };
}

interface ProjectStats {
  files: number;
  branches: number;
  commits: number;
  issues: number;
  contributors: number;
  linesOfCode: number;
}

interface ActivityItem {
  id: string;
  type: "commit" | "branch" | "file" | "release";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ vscode }) => {
  const [stats] = useState<ProjectStats>({
    files: 23,
    branches: 5,
    commits: 42,
    issues: 0,
    contributors: 3,
    linesOfCode: 1247,
  });

  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "release",
      title: "VS Code Extension Created",
      description: "Successfully packaged and installed StackCode extension",
      timestamp: "2 min ago",
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: "2",
      type: "commit",
      title: "Project Compiled",
      description: "TypeScript compilation completed successfully",
      timestamp: "5 min ago",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: "3",
      type: "file",
      title: "README Updated",
      description: "Added new documentation sections",
      timestamp: "15 min ago",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "4",
      type: "branch",
      title: "Feature Branch",
      description: "Created feature/vscode-proactive-notifications",
      timestamp: "30 min ago",
      icon: <GitBranch className="w-5 h-5" />,
    },
  ]);

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
      color: "from-blue-500 to-blue-600",
      onClick: () => sendMessage("stackcode.init"),
    },
    {
      id: "stackcode.generate.readme",
      title: "Generate README",
      description: "Create comprehensive docs",
      icon: <Book className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      onClick: () => sendMessage("stackcode.generate.readme"),
    },
    {
      id: "stackcode.git.start",
      title: "Start Feature",
      description: "Begin new development",
      icon: <GitBranch className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      onClick: () => sendMessage("stackcode.git.start"),
    },
    {
      id: "stackcode.commit",
      title: "Smart Commit",
      description: "Conventional commits",
      icon: <GitCommit className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      onClick: () => sendMessage("stackcode.commit"),
    },
    {
      id: "stackcode.validate",
      title: "Validate Project",
      description: "Check best practices",
      icon: <Shield className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      onClick: () => sendMessage("stackcode.validate"),
    },
    {
      id: "stackcode.release",
      title: "Create Release",
      description: "Package and deploy",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
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

  useEffect(() => {
    // Animate numbers on load
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-12 h-12 text-white animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Files",
              value: stats.files,
              icon: <FileText className="w-5 h-5" />,
              color: "text-blue-400",
            },
            {
              label: "Branches",
              value: stats.branches,
              icon: <GitBranch className="w-5 h-5" />,
              color: "text-green-400",
            },
            {
              label: "Commits",
              value: stats.commits,
              icon: <GitCommit className="w-5 h-5" />,
              color: "text-purple-400",
            },
            {
              label: "Issues",
              value: stats.issues,
              icon: <Shield className="w-5 h-5" />,
              color: "text-red-400",
            },
            {
              label: "Contributors",
              value: stats.contributors,
              icon: <Users className="w-5 h-5" />,
              color: "text-orange-400",
            },
            {
              label: "Lines",
              value: stats.linesOfCode,
              icon: <Code className="w-5 h-5" />,
              color: "text-indigo-400",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.color}`}>{stat.icon}</div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold animate-number">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className={`group relative overflow-hidden bg-gradient-to-br ${action.color} rounded-xl p-4 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-3">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
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

        {/* Pro Tips */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-semibold">Pro Tips</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
