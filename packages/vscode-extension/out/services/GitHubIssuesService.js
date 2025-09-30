"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIssuesService = void 0;
const core_1 = require("@stackcode/core");
/**
 * GitHubIssuesService - Orquestra a busca de issues do GitHub
 *
 * Responsabilidades:
 * 1. Integrar autenticação + detecção de repositório + busca de issues
 * 2. Gerenciar cache local de issues
 * 3. Fornecer interface simplificada para a UI
 */
class GitHubIssuesService {
    constructor(authService, gitMonitor) {
        this._issuesCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutos
        this._authService = authService;
        this._gitMonitor = gitMonitor;
    }
    /**
     * Busca issues do repositório atual
     */
    async fetchCurrentRepositoryIssues(options) {
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
        }
        catch (error) {
            console.error("❌ [GitHubIssuesService] Failed to fetch current repository issues:", error);
            throw error;
        }
    }
    /**
     * Busca issues de um repositório específico
     */
    async fetchRepositoryIssues(repository, options) {
        try {
            const cacheKey = this.getCacheKey(repository, options);
            // Verificar cache
            const cached = this._issuesCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log("[GitHubIssuesService] Returning cached issues");
                return cached.issues;
            }
            // Buscar issues
            const octokit = this._authService.getAuthenticatedClient();
            const fetchOptions = {
                owner: repository.owner,
                repo: repository.repo,
                state: "open",
                sort: "updated",
                direction: "desc",
                per_page: 30,
                ...options,
            };
            console.log(`[GitHubIssuesService] Fetching issues for ${repository.fullName}`);
            const issues = await (0, core_1.fetchRepositoryIssues)(octokit, fetchOptions);
            // Atualizar cache
            this._issuesCache.set(cacheKey, {
                issues,
                timestamp: Date.now(),
            });
            return issues;
        }
        catch (error) {
            console.error("[GitHubIssuesService] Failed to fetch repository issues:", error);
            throw error;
        }
    }
    /**
     * Busca issues atribuídas ao usuário atual
     */
    async fetchMyIssues(repository) {
        try {
            const userInfo = this._authService.userInfo;
            if (!userInfo?.username) {
                throw new Error("User information not available");
            }
            const targetRepo = repository || (await this._gitMonitor.getCurrentGitHubRepository());
            if (!targetRepo) {
                throw new Error("No GitHub repository available");
            }
            return await this.fetchRepositoryIssues(targetRepo, {
                assignee: userInfo.username,
                state: "open",
            });
        }
        catch (error) {
            console.error("[GitHubIssuesService] Failed to fetch my issues:", error);
            throw error;
        }
    }
    /**
     * Limpa cache de issues
     */
    clearCache() {
        this._issuesCache.clear();
        console.log("[GitHubIssuesService] Cache cleared");
    }
    /**
     * Limpa cache expirado
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, cache] of this._issuesCache.entries()) {
            if (now - cache.timestamp >= this.CACHE_TTL) {
                this._issuesCache.delete(key);
            }
        }
    }
    /**
     * Gera chave única para cache baseada no repositório e opções
     */
    getCacheKey(repository, options) {
        const optionsStr = JSON.stringify(options || {});
        return `${repository.fullName}:${optionsStr}`;
    }
    /**
     * Força atualização de issues (ignora cache)
     */
    async refreshIssues(repository) {
        const targetRepo = repository || (await this._gitMonitor.getCurrentGitHubRepository());
        if (!targetRepo) {
            throw new Error("No GitHub repository available");
        }
        // Limpar cache para este repositório
        const cacheKeys = Array.from(this._issuesCache.keys()).filter((key) => key.startsWith(targetRepo.fullName));
        cacheKeys.forEach((key) => this._issuesCache.delete(key));
        return await this.fetchRepositoryIssues(targetRepo);
    }
}
exports.GitHubIssuesService = GitHubIssuesService;
//# sourceMappingURL=GitHubIssuesService.js.map