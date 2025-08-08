import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Settings,
  Zap,
  Book,
  Shield,
  GitCommit,
  Package,
  Flame,
  BarChart3,
  HelpCircle,
  Play,
  FolderOpen,
  Rocket,
} from "lucide-react";

interface TreeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  command?: string;
  children?: TreeItem[];
  expanded?: boolean;
}

interface ProjectViewProps {
  onCommand?: (command: string) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ onCommand }) => {
  const [treeData, setTreeData] = useState<TreeItem[]>([
    {
      id: "stackcode-project",
      label: "StackCode Project",
      icon: <Rocket className="w-4 h-4 text-blue-400" />,
      expanded: true,
      children: [
        {
          id: "quick-actions",
          label: "Quick Actions",
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          expanded: true,
          children: [
            {
              id: "init-project",
              label: "Initialize Project",
              icon: <FolderOpen className="w-4 h-4 text-green-400" />,
              description: "Set up StackCode scaffolding",
              command: "stackcode.init",
            },
            {
              id: "generate-readme",
              label: "Generate README",
              icon: <Book className="w-4 h-4 text-blue-400" />,
              description: "Create comprehensive documentation",
              command: "stackcode.generate.readme",
            },
            {
              id: "generate-gitignore",
              label: "Generate .gitignore",
              icon: <GitBranch className="w-4 h-4 text-purple-400" />,
              description: "Create .gitignore based on project type",
              command: "stackcode.generate.gitignore",
            },
            {
              id: "validate-project",
              label: "Validate Project",
              icon: <Shield className="w-4 h-4 text-red-400" />,
              description: "Check project structure and best practices",
              command: "stackcode.validate",
            },
          ],
        },
        {
          id: "git-workflow",
          label: "Git Workflow",
          icon: <GitCommit className="w-4 h-4 text-orange-400" />,
          expanded: true,
          children: [
            {
              id: "start-feature",
              label: "Start Feature",
              icon: <GitBranch className="w-4 h-4 text-green-400" />,
              description: "Begin a new feature using GitFlow",
              command: "stackcode.git.start",
            },
            {
              id: "create-hotfix",
              label: "Create Hotfix",
              icon: <Flame className="w-4 h-4 text-red-400" />,
              description: "Create a hotfix branch for urgent fixes",
              command: "stackcode.git.finish",
            },
            {
              id: "make-release",
              label: "Make Release",
              icon: <Package className="w-4 h-4 text-purple-400" />,
              description: "Create a new release with automated versioning",
              command: "stackcode.release",
            },
            {
              id: "commit-changes",
              label: "Commit Changes",
              icon: <GitCommit className="w-4 h-4 text-blue-400" />,
              description: "Make a conventional commit with validation",
              command: "stackcode.commit",
            },
          ],
        },
        {
          id: "project-tools",
          label: "Project Tools",
          icon: <Settings className="w-4 h-4 text-gray-400" />,
          expanded: false,
          children: [
            {
              id: "configuration",
              label: "Configuration",
              icon: <Settings className="w-4 h-4 text-gray-400" />,
              description: "Configure StackCode settings",
              command: "stackcode.config",
            },
            {
              id: "show-dashboard",
              label: "Show Dashboard",
              icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
              description: "Open the interactive StackCode dashboard",
              command: "stackcode.dashboard",
            },
            {
              id: "project-stats",
              label: "View Project Stats",
              icon: <BarChart3 className="w-4 h-4 text-green-400" />,
              description: "See detailed project statistics",
              command: "stackcode.validate",
            },
            {
              id: "help-docs",
              label: "Help & Documentation",
              icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
              description: "Access StackCode documentation",
              command: "stackcode.config",
            },
          ],
        },
      ],
    },
  ]);

  const toggleExpanded = (id: string) => {
    const updateTree = (items: TreeItem[]): TreeItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) };
        }
        return item;
      });
    };

    setTreeData(updateTree(treeData));
  };

  const handleCommand = (command: string) => {
    if (onCommand) {
      onCommand(command);
    }
  };

  const renderTreeItem = (item: TreeItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.expanded;

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer hover:bg-slate-700/50 transition-colors duration-200 group ${
            level > 0 ? "ml-4" : ""
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.command) {
              handleCommand(item.command);
            }
          }}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </div>
          )}

          {!hasChildren && <div className="w-4" />}

          <div className="flex-shrink-0">{item.icon}</div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">
              {item.label}
            </div>
            {item.description && (
              <div className="text-xs text-slate-400 truncate">
                {item.description}
              </div>
            )}
          </div>

          {item.command && (
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 text-white h-full overflow-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700">
          <Rocket className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">StackCode</h2>
        </div>

        <div className="space-y-1">
          {treeData.map((item) => renderTreeItem(item))}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
