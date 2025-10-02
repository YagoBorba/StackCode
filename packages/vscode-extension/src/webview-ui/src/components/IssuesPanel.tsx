import React from "react";
import {
  AlertCircle,
  ExternalLink,
  Clock,
  User,
  Tag,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { useTranslation } from "../utils/i18n";

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

interface IssuesPanelProps {
  issuesState: IssuesState;
  onRefresh: () => void;
  onLogin: () => void;
}

export default function IssuesPanel({
  issuesState,
  onRefresh,
  onLogin,
}: IssuesPanelProps) {
  const { issues, loading, error, needsAuth } = issuesState;
  const { t } = useTranslation();

  // Formatador de tempo relativo
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Função para abrir issue no GitHub
  const openIssue = (url: string) => {
    // No VS Code, usar comando para abrir URL
    // Na web, usar window.open
    if (typeof window !== "undefined" && window.open) {
      window.open(url, "_blank");
    }
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            {t("github.ui.repository_issues")}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
          <span className="text-slate-300 font-medium">
            {t("github.ui.fetching_issues")}
          </span>
          <span className="text-slate-400 text-sm mt-1">
            {t("github.ui.please_wait")}
          </span>
        </div>
      </div>
    );
  }

  // Estado de erro de autenticação
  if (needsAuth) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Repository Issues
          </h3>
        </div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-400" />
          {t("github.ui.repository_issues")}
        </h3>
        <div className="text-center py-8">
          <LogIn className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">
            {t("github.ui.login_to_view_issues")}
          </p>
          <button
            onClick={onLogin}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t("github.ui.login_github")}
          </button>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            {t("github.ui.repository_issues")}
          </h3>
          <button
            onClick={onRefresh}
            className="text-slate-400 hover:text-white transition-colors"
            title={t("github.ui.refresh_issues")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            {t("github.ui.refresh_issues")}
          </button>
        </div>
      </div>
    );
  }

  // Lista vazia
  if (issues.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-400" />
            {t("github.ui.repository_issues")}
          </h3>
          <button
            onClick={onRefresh}
            className="text-slate-400 hover:text-white transition-colors"
            title={t("github.ui.refresh_issues")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-slate-400">{t("github.ui.no_issues_found")}</p>
          <p className="text-slate-500 text-sm mt-1">
            {t("github.ui.great_job_clean")}
          </p>
        </div>
      </div>
    );
  }

  // Lista de issues
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          {t("github.ui.repository_issues")}
          <span className="text-sm text-slate-400 font-normal">
            ({issues.length})
          </span>
        </h3>
        <button
          onClick={onRefresh}
          className="text-slate-400 hover:text-white transition-colors"
          title={t("github.ui.refresh_issues")}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {issues.slice(0, 10).map((issue) => (
          <div
            key={issue.id}
            className="border border-slate-600 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer"
            onClick={() => openIssue(issue.html_url)}
          >
            {/* Header da issue */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  #{issue.number} {issue.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {issue.user.login}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(issue.updated_at)}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {issue.labels.slice(0, 3).map((label) => (
                  <span
                    key={label.name}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: `#${label.color}20`,
                      borderColor: `#${label.color}40`,
                      color: `#${label.color}`,
                      border: "1px solid",
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {label.name}
                  </span>
                ))}
                {issue.labels.length > 3 && (
                  <span className="text-xs text-slate-400">
                    +{issue.labels.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Assignees */}
            {issue.assignees.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-400">Assigned to:</span>
                <div className="flex -space-x-1">
                  {issue.assignees.slice(0, 3).map((assignee) => (
                    <img
                      key={assignee.login}
                      src={assignee.avatar_url}
                      alt={assignee.login}
                      className="w-5 h-5 rounded-full border border-slate-600"
                      title={assignee.login}
                    />
                  ))}
                  {issue.assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs text-slate-300">
                      +{issue.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {issues.length > 10 && (
          <div className="text-center py-2">
            <p className="text-slate-400 text-sm">
              Showing 10 of {issues.length} issues
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
