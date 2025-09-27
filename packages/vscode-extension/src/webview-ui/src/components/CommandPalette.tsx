import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Command,
  GitBranch,
  Settings,
  Package,
  Shield,
  Book,
  FolderOpen,
  GitCommit,
  BarChart3,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  command: string;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onCommand,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "init",
      title: "Initialize Project",
      description: "Set up StackCode scaffolding for your project",
      icon: <FolderOpen className="w-4 h-4" />,
      command: "stackcode.init",
      category: "Project",
      keywords: ["init", "setup", "scaffold", "create"],
    },
    {
      id: "generate-readme",
      title: "Generate README",
      description: "Create a comprehensive README.md file",
      icon: <Book className="w-4 h-4" />,
      command: "stackcode.generate.readme",
      category: "Generate",
      keywords: ["readme", "documentation", "docs", "generate"],
    },
    {
      id: "generate-gitignore",
      title: "Generate .gitignore",
      description: "Create .gitignore based on project type",
      icon: <GitBranch className="w-4 h-4" />,
      command: "stackcode.generate.gitignore",
      category: "Generate",
      keywords: ["gitignore", "ignore", "git", "generate"],
    },
    {
      id: "start-feature",
      title: "Start Feature Branch",
      description: "Begin a new feature using GitFlow",
      icon: <GitBranch className="w-4 h-4" />,
      command: "stackcode.git.start",
      category: "Git",
      keywords: ["feature", "branch", "git", "start", "flow"],
    },
    {
      id: "commit",
      title: "Smart Commit",
      description: "Make a conventional commit with validation",
      icon: <GitCommit className="w-4 h-4" />,
      command: "stackcode.commit",
      category: "Git",
      keywords: ["commit", "conventional", "message", "git"],
    },
    {
      id: "validate",
      title: "Validate Project",
      description: "Check project structure and best practices",
      icon: <Shield className="w-4 h-4" />,
      command: "stackcode.validate",
      category: "Tools",
      keywords: ["validate", "check", "best practices", "lint"],
    },
    {
      id: "release",
      title: "Create Release",
      description: "Create a new release with automated versioning",
      icon: <Package className="w-4 h-4" />,
      command: "stackcode.release",
      category: "Release",
      keywords: ["release", "version", "publish", "deploy"],
    },
    {
      id: "config",
      title: "Configuration",
      description: "Configure StackCode settings",
      icon: <Settings className="w-4 h-4" />,
      command: "stackcode.config",
      category: "Settings",
      keywords: ["config", "settings", "preferences", "setup"],
    },
    {
      id: "dashboard",
      title: "Show Dashboard",
      description: "Open the interactive StackCode dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
      command: "stackcode.dashboard",
      category: "View",
      keywords: ["dashboard", "overview", "stats", "view"],
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchTerm = query.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.category.toLowerCase().includes(searchTerm) ||
      command.keywords.some((keyword) => keyword.includes(searchTerm))
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleCommand(filteredCommands[selectedIndex].command);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleCommand = (command: string) => {
    onCommand(command);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Command className="w-3 h-3" />
            <span>+</span>
            <span>K</span>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => handleCommand(command.command)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-600/20 border border-blue-500/30"
                      : "hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex-shrink-0 text-slate-400">
                    {command.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">
                      {command.title}
                    </div>
                    <div className="text-sm text-slate-400 truncate">
                      {command.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                    {command.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
