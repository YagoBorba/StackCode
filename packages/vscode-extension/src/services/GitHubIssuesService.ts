import { GitHubAuthService } from "./GitHubAuthService";
import { GitMonitor, type GitHubRepository } from "../monitors/GitMonitor";
import { fetchRepositoryIssues, type GitHubIssue, type FetchIssuesOptions } from "@stackcode/core";

/**
 * GitHubIssuesService - Orquestra a busca de issues do GitHub
 * 
 * Responsabilidades:
 * 1. Integrar autenticação + detecção de repositório + busca de issues
 * 2. Gerenciar cache local de issues
 * 3. Fornecer interface simplificada para a UI
 */
export class GitHubIssuesService {
  private _authService: GitHubAuthService;
  private _gitMonitor: GitMonitor;
  private _issuesCache: Map<string, { issues: GitHubIssue[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(authService: GitHubAuthService, gitMonitor: GitMonitor) {
    this._authService = authService;
    this._gitMonitor = gitMonitor;
  }

  /**
   * Busca issues do repositório atual
   */
  public async fetchCurrentRepositoryIssues(options?: Partial<FetchIssuesOptions>): Promise<GitHubIssue[]> {
    try {
      console.log("🔍 [GitHubIssuesService] Starting fetchCurrentRepositoryIssues...");
      
      // Verificar autenticação
      if (!this._authService.isAuthenticated) {
        console.warn("❌ [GitHubIssuesService] User not authenticated");
        throw new Error("User not authenticated with GitHub");
      }
      console.log("✅ [GitHubIssuesService] User is authenticated");

      // Detectar repositório atual
      console.log("🔍 [GitHubIssuesService] Detecting current repository...");
      const repository = await this._gitMonitor.getCurrentGitHubRepository();
      if (!repository) {
        console.warn("❌ [GitHubIssuesService] No GitHub repository detected");
        throw new Error("No GitHub repository detected in current workspace");
      }
      console.log(`✅ [GitHubIssuesService] Repository detected: ${repository.owner}/${repository.repo}`);

      console.log("🚀 [GitHubIssuesService] Fetching issues...");
      const issues = await this.fetchRepositoryIssues(repository, options);
      console.log(`✅ [GitHubIssuesService] Found ${issues.length} issues`);
      
      return issues;
    } catch (error) {
      console.error("❌ [GitHubIssuesService] Failed to fetch current repository issues:", error);
      throw error;
    }
  }

  /**
   * Busca issues de um repositório específico
   */
  public async fetchRepositoryIssues(
    repository: GitHubRepository,
    options?: Partial<FetchIssuesOptions>
  ): Promise<GitHubIssue[]> {
    try {
      const cacheKey = this.getCacheKey(repository, options);
      
      // Verificar cache
      const cached = this._issuesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        console.log("[GitHubIssuesService] Returning cached issues");
        return cached.issues;
      }

      // Buscar issues
      const octokit = this._authService.getAuthenticatedClient();
      const fetchOptions: FetchIssuesOptions = {
        owner: repository.owner,
        repo: repository.repo,
        state: "open",
        sort: "updated",
        direction: "desc",
        per_page: 30,
        ...options,
      };

      console.log(`[GitHubIssuesService] Fetching issues for ${repository.fullName}`);
      const issues = await fetchRepositoryIssues(octokit, fetchOptions);

      // Atualizar cache
      this._issuesCache.set(cacheKey, {
        issues,
        timestamp: Date.now(),
      });

      return issues;
    } catch (error) {
      console.error("[GitHubIssuesService] Failed to fetch repository issues:", error);
      throw error;
    }
  }

  /**
   * Busca issues atribuídas ao usuário atual
   */
  public async fetchMyIssues(repository?: GitHubRepository): Promise<GitHubIssue[]> {
    try {
      const userInfo = this._authService.userInfo;
      if (!userInfo?.username) {
        throw new Error("User information not available");
      }

      const targetRepo = repository || await this._gitMonitor.getCurrentGitHubRepository();
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
   * Limpa cache de issues
   */
  public clearCache(): void {
    this._issuesCache.clear();
    console.log("[GitHubIssuesService] Cache cleared");
  }

  /**
   * Limpa cache expirado
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cache] of this._issuesCache.entries()) {
      if ((now - cache.timestamp) >= this.CACHE_TTL) {
        this._issuesCache.delete(key);
      }
    }
  }

  /**
   * Gera chave única para cache baseada no repositório e opções
   */
  private getCacheKey(repository: GitHubRepository, options?: Partial<FetchIssuesOptions>): string {
    const optionsStr = JSON.stringify(options || {});
    return `${repository.fullName}:${optionsStr}`;
  }

  /**
   * Força atualização de issues (ignora cache)
   */
  public async refreshIssues(repository?: GitHubRepository): Promise<GitHubIssue[]> {
    const targetRepo = repository || await this._gitMonitor.getCurrentGitHubRepository();
    if (!targetRepo) {
      throw new Error("No GitHub repository available");
    }

    // Limpar cache para este repositório
    const cacheKeys = Array.from(this._issuesCache.keys()).filter(key => 
      key.startsWith(targetRepo.fullName)
    );
    cacheKeys.forEach(key => this._issuesCache.delete(key));

    return await this.fetchRepositoryIssues(targetRepo);
  }
}
