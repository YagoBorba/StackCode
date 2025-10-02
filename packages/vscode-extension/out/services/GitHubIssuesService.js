"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIssuesService = void 0;
const core_1 = require("@stackcode/core");
/**
 * GitHubIssuesService - Thin wrapper around core issues workflow
 *
 * This service now delegates all business logic to @stackcode/core,
 * providing only VS Code-specific integration (auth + git detection).
 *
 * @deprecated Consider using runIssuesWorkflow directly with authenticated client
 */
class GitHubIssuesService {
    constructor(authService, gitMonitor) {
        this._authService = authService;
        this._gitMonitor = gitMonitor;
    }
    /**
     * Busca issues do repositório atual usando o workflow centralizado do core
     */
    async fetchCurrentRepositoryIssues(options) {
        try {
            console.log("🔍 [GitHubIssuesService] Starting fetchCurrentRepositoryIssues...");
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
     * Busca issues de um repositório específico usando o workflow centralizado do core
     */
    async fetchRepositoryIssues(repository, options) {
        try {
            // Get authenticated client
            const client = await this._authService.getAuthenticatedClient();
            // Run the centralized issues workflow from core
            const result = await (0, core_1.runIssuesWorkflow)({
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
     * Limpa cache de issues (delega para o core)
     */
    clearCache() {
        // Import dynamically to avoid circular dependencies
        Promise.resolve().then(() => __importStar(require("@stackcode/core"))).then(({ clearIssuesCache }) => {
            clearIssuesCache();
            console.log("[GitHubIssuesService] Cache cleared via core");
        });
    }
    /**
     * Limpa cache expirado (delega para o core)
     */
    clearExpiredCache() {
        Promise.resolve().then(() => __importStar(require("@stackcode/core"))).then(({ clearExpiredIssuesCache }) => {
            clearExpiredIssuesCache();
        });
    }
    /**
     * Força atualização de issues (ignora cache)
     */
    async refreshIssues(repository) {
        const targetRepo = repository || (await this._gitMonitor.getCurrentGitHubRepository());
        if (!targetRepo) {
            throw new Error("No GitHub repository available");
        }
        (0, core_1.clearRepositoryCache)({
            owner: targetRepo.owner,
            repo: targetRepo.repo,
            fullName: targetRepo.fullName,
        });
        return await this.fetchRepositoryIssues(targetRepo);
    }
}
exports.GitHubIssuesService = GitHubIssuesService;
//# sourceMappingURL=GitHubIssuesService.js.map