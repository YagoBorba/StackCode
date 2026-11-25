/**
 * Translation hook for VSCode extension React components
 */

const translations = {
  pt: {
    "github.ui.repository_issues": "Issues do Repositório",
    "github.ui.no_issues_found": "Nenhuma issue aberta encontrada!",
    "github.ui.great_job_clean": "Ótimo trabalho mantendo tudo limpo ✨",
    "github.ui.refresh_issues": "Atualizar issues",
    "github.ui.login_to_view_issues":
      "Faça login no GitHub para ver as issues do repositório",
    "github.ui.login_github": "Entrar no GitHub",
    "github.ui.error_loading_issues": "Erro ao carregar issues",
    "github.ui.loading_issues": "Carregando issues...",
    "github.ui.view_on_github": "Ver no GitHub",
    "github.ui.created_by": "Criado por",
    "github.ui.updated": "Atualizado",
    "github.ui.assigned_to": "Atribuído para",
    "github.ui.open_issue": "Abrir issue",
    "dashboard.project_stats": "Estatísticas do Projeto",
    "dashboard.files": "Arquivos",
    "dashboard.branches": "Branches",
    "dashboard.commits": "Commits",
    "dashboard.issues": "Issues",
    "dashboard.contributors": "Contribuidores",
    "dashboard.lines_of_code": "Linhas de Código",
    "dashboard.welcome": "Bem-vindo ao StackCode",
    "dashboard.getting_started": "Começando",
    "dashboard.quick_actions": "Ações Rápidas",
    "dashboard.recent_activity": "Atividade Recente",
  },
  en: {
    "github.ui.repository_issues": "Repository Issues",
    "github.ui.no_issues_found": "No open issues found!",
    "github.ui.great_job_clean": "Great job keeping things clean ✨",
    "github.ui.refresh_issues": "Refresh issues",
    "github.ui.login_to_view_issues":
      "Login to GitHub to view repository issues",
    "github.ui.login_github": "Login to GitHub",
    "github.ui.error_loading_issues": "Error loading issues",
    "github.ui.loading_issues": "Loading issues...",
    "github.ui.view_on_github": "View on GitHub",
    "github.ui.created_by": "Created by",
    "github.ui.updated": "Updated",
    "github.ui.assigned_to": "Assigned to",
    "github.ui.open_issue": "Open issue",
    "dashboard.project_stats": "Project Statistics",
    "dashboard.files": "Files",
    "dashboard.branches": "Branches",
    "dashboard.commits": "Commits",
    "dashboard.issues": "Issues",
    "dashboard.contributors": "Contributors",
    "dashboard.lines_of_code": "Lines of Code",
    "dashboard.welcome": "Welcome to StackCode",
    "dashboard.getting_started": "Getting Started",
    "dashboard.quick_actions": "Quick Actions",
    "dashboard.recent_activity": "Recent Activity",
  },
};

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const currentLanguage = "pt";

  const t = (key: string): string => {
    const translation =
      translations[currentLanguage as keyof typeof translations]?.[
        key as keyof typeof translations.pt
      ];
    return translation || key;
  };

  return { t };
}

/**
 * Utility function for direct translation
 */
export function translate(key: string, language: "pt" | "en" = "pt"): string {
  const translation =
    translations[language]?.[key as keyof typeof translations.pt];
  return translation || key;
}
