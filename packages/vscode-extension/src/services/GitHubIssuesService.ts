import { GitHubAuthService } from "./GitHubAuthService";
import { GitMonitor, type GitHubRepository } from "../monitors/GitMonitor";
import {
  runIssuesWorkflow,
  clearRepositoryCache,
  type GitHubIssue,
  type FetchIssuesOptions,
} from "@stackcode/core";

/**
 * GitHubIssuesService - Thin wrapper around core issues workflow
 *
 * This service now delegates all business logic to @stackcode/core,
 * providing only VS Code-specific integration (auth + git detection).
 * 
 * @deprecated Consider using runIssuesWorkflow directly with authenticated client
 */
export class GitHubIssuesService {
  private _authService: GitHubAuthService;
  private _gitMonitor: GitMonitor;

  constructor(authService: GitHubAuthService, gitMonitor: GitMonitor) {
    this._authService = authService;
    this._gitMonitor = gitMonitor;
  }

  /**
   * Busca issues do repositório atual usando o workflow centralizado do core
   */
  public async fetchCurrentRepositoryIssues(
    options?: Partial<FetchIssuesOptions>,
  ): Promise<GitHubIssue[]> {
    try {
      console.log(
        "🔍 [GitHubIssuesService] Starting fetchCurrentRepositoryIssues...",
      );

      if (!this._authService.isAuthenticated) {
        console.warn("❌ [GitHubIssuesService] User not authenticated");
        throw new Error("User not authenticated with GitHub");
      }
      console.log("✅ [GitHubIssuesService] User is authenticated");

      console.log("🔍 [GitHubIssuesService] Detecting current repository...");
      const repository = await this._gitMonitor.getCurrentGitHubRepository();
      if (!repository) {
        console.warn("❌ [GitHubIssuesService] No GitHub repository detected");
        throw new Error("No GitHub repository detected in current workspace");
      }
      console.log(
        `✅ [GitHubIssuesService] Repository detected: ${repository.owner}/${repository.repo}`,
      );

      console.log("🚀 [GitHubIssuesService] Fetching issues...");
      const issues = await this.fetchRepositoryIssues(repository, options);
      console.log(`✅ [GitHubIssuesService] Found ${issues.length} issues`);

      return issues;
    } catch (error) {
      console.error(
        "❌ [GitHubIssuesService] Failed to fetch current repository issues:",
        error,
      );
      throw error;
    }
  }

  /**
   * Busca issues de um repositório específico usando o workflow centralizado do core
   */
  public async fetchRepositoryIssues(
    repository: GitHubRepository,
    options?: Partial<FetchIssuesOptions>,
  ): Promise<GitHubIssue[]> {
    try {
      // Get authenticated client
      const client = await this._authService.getAuthenticatedClient();

      // Run the centralized issues workflow from core
      const result = await runIssuesWorkflow({
        client,
        repository: {
          owner: repository.owner,
          repo: repository.repo,
          fullName: repository.fullName,
        },
        fetchOptions: options,
        enableCache: true,
      });

      if (result.status === "error") {
        throw new Error(result.error || "Failed to fetch repository issues");
      }

      return result.issues;
    } catch (error) {
      console.error(
        "[GitHubIssuesService] Failed to fetch repository issues:",
        error,
      );
      throw error;
    }
  }

  /**
   * Busca issues atribuídas ao usuário atual
   */
  public async fetchMyIssues(
    repository?: GitHubRepository,
  ): Promise<GitHubIssue[]> {
    try {
      const userInfo = this._authService.userInfo;
      if (!userInfo?.username) {
        throw new Error("User information not available");
      }

      const targetRepo =
        repository || (await this._gitMonitor.getCurrentGitHubRepository());
      if (!targetRepo) {
        throw new Error("No GitHub repository available");
      }

      return await this.fetchRepositoryIssues(targetRepo, {
        assignee: userInfo.username,
        state: "open",
      });
    } catch (error) {
      console.error("[GitHubIssuesService] Failed to fetch my issues:", error);
      throw error;
    }
  }

  /**
   * Limpa cache de issues (delega para o core)
   */
  public clearCache(): void {
    // Import dynamically to avoid circular dependencies
    import("@stackcode/core").then(({ clearIssuesCache }) => {
      clearIssuesCache();
      console.log("[GitHubIssuesService] Cache cleared via core");
    });
  }

  /**
   * Limpa cache expirado (delega para o core)
   */
  public clearExpiredCache(): void {
    import("@stackcode/core").then(({ clearExpiredIssuesCache }) => {
      clearExpiredIssuesCache();
    });
  }

  /**
   * Força atualização de issues (ignora cache)
   */
  public async refreshIssues(
    repository?: GitHubRepository,
  ): Promise<GitHubIssue[]> {
    const targetRepo =
      repository || (await this._gitMonitor.getCurrentGitHubRepository());
    if (!targetRepo) {
      throw new Error("No GitHub repository available");
    }

    clearRepositoryCache({
      owner: targetRepo.owner,
      repo: targetRepo.repo,
      fullName: targetRepo.fullName,
    });

    return await this.fetchRepositoryIssues(targetRepo);
  }
}
