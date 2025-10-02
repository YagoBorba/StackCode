import type { Octokit } from "@octokit/rest";
import { fetchRepositoryIssues, type GitHubIssue, type FetchIssuesOptions } from "./github.js";

/**
 * Repository information required for issues workflow
 */
export interface IssuesWorkflowRepository {
  owner: string;
  repo: string;
  fullName?: string;
}

/**
 * Options for running the issues workflow
 */
export interface IssuesWorkflowOptions {
  /** Authenticated Octokit client */
  client: Octokit;
  /** Repository to fetch issues from */
  repository: IssuesWorkflowRepository;
  /** Optional fetch options (state, assignee, labels, etc.) */
  fetchOptions?: Partial<FetchIssuesOptions>;
  /** Whether to enable caching (default: true) */
  enableCache?: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
}

/**
 * Result of the issues workflow
 */
export interface IssuesWorkflowResult {
  status: "success" | "error";
  issues: GitHubIssue[];
  cached: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Progress step types for issues workflow
 */
export type IssuesWorkflowStep = "fetching" | "caching" | "completed" | "error";

/**
 * Progress information for issues workflow
 */
export interface IssuesWorkflowProgress {
  step: IssuesWorkflowStep;
  message?: string;
}

/**
 * Hooks for issues workflow callbacks
 */
export interface IssuesWorkflowHooks {
  onProgress?(progress: IssuesWorkflowProgress): Promise<void> | void;
}

/**
 * Global cache for issues
 * Key format: "owner/repo:optionsJson"
 */
const issuesCache = new Map<
  string,
  { issues: GitHubIssue[]; timestamp: number }
>();

/**
 * Default cache TTL: 5 minutes
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Runs the issues workflow to fetch GitHub issues for a repository.
 * 
 * This is the centralized business logic for fetching issues that can be used
 * by both CLI and VS Code extension, ensuring consistent behavior across interfaces.
 * 
 * @param options - Workflow options including client, repository, and fetch options
 * @param hooks - Optional callbacks for progress reporting
 * @returns Promise with workflow result containing issues and metadata
 * 
 * @example
 * ```typescript
 * const result = await runIssuesWorkflow({
 *   client: authenticatedOctokit,
 *   repository: { owner: "user", repo: "project" },
 *   fetchOptions: { state: "open", assignee: "username" }
 * });
 * 
 * if (result.status === "success") {
 *   console.log(`Found ${result.issues.length} issues`);
 * }
 * ```
 */
export async function runIssuesWorkflow(
  options: IssuesWorkflowOptions,
  hooks?: IssuesWorkflowHooks,
): Promise<IssuesWorkflowResult> {
  const {
    client,
    repository,
    fetchOptions = {},
    enableCache = true,
    cacheTTL = DEFAULT_CACHE_TTL,
  } = options;

  const timestamp = new Date().toISOString();

  try {
    // Report fetching progress
    await hooks?.onProgress?.({ step: "fetching", message: "Fetching issues from GitHub..." });

    // Generate cache key
    const cacheKey = generateCacheKey(repository, fetchOptions);

    // Check cache if enabled
    if (enableCache) {
      const cached = issuesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        console.log(`[Core] Returning cached issues for ${repository.owner}/${repository.repo}`);
        await hooks?.onProgress?.({ step: "completed", message: "Returned cached issues" });
        
        return {
          status: "success",
          issues: cached.issues,
          cached: true,
          timestamp,
        };
      }
    }

    // Build full fetch options
    const fullFetchOptions: FetchIssuesOptions = {
      owner: repository.owner,
      repo: repository.repo,
      state: "open",
      sort: "updated",
      direction: "desc",
      per_page: 30,
      ...fetchOptions,
    };

    // Fetch issues from GitHub
    console.log(`[Core] Fetching issues for ${repository.owner}/${repository.repo}...`);
    const issues = await fetchRepositoryIssues(client, fullFetchOptions);

    // Cache the results if enabled
    if (enableCache) {
      await hooks?.onProgress?.({ step: "caching", message: "Caching results..." });
      issuesCache.set(cacheKey, {
        issues,
        timestamp: Date.now(),
      });
    }

    await hooks?.onProgress?.({ step: "completed", message: `Found ${issues.length} issues` });

    return {
      status: "success",
      issues,
      cached: false,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Core] Failed to fetch issues for ${repository.owner}/${repository.repo}:`, error);
    
    await hooks?.onProgress?.({ step: "error", message: errorMessage });

    return {
      status: "error",
      issues: [],
      cached: false,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Clears all cached issues
 */
export function clearIssuesCache(): void {
  issuesCache.clear();
  console.log("[Core] Issues cache cleared");
}

/**
 * Clears expired cache entries
 * 
 * @param cacheTTL - Time to live in milliseconds (default: 5 minutes)
 */
export function clearExpiredIssuesCache(cacheTTL = DEFAULT_CACHE_TTL): void {
  const now = Date.now();
  let clearedCount = 0;

  for (const [key, cache] of issuesCache.entries()) {
    if (now - cache.timestamp >= cacheTTL) {
      issuesCache.delete(key);
      clearedCount++;
    }
  }

  if (clearedCount > 0) {
    console.log(`[Core] Cleared ${clearedCount} expired cache entries`);
  }
}

/**
 * Clears cache for a specific repository
 * 
 * @param repository - Repository to clear cache for
 */
export function clearRepositoryCache(repository: IssuesWorkflowRepository): void {
  const fullName = repository.fullName || `${repository.owner}/${repository.repo}`;
  let clearedCount = 0;

  const keysToDelete = Array.from(issuesCache.keys()).filter((key) =>
    key.startsWith(fullName),
  );

  keysToDelete.forEach((key) => {
    issuesCache.delete(key);
    clearedCount++;
  });

  if (clearedCount > 0) {
    console.log(`[Core] Cleared ${clearedCount} cache entries for ${fullName}`);
  }
}

/**
 * Generates a unique cache key for a repository and fetch options
 */
function generateCacheKey(
  repository: IssuesWorkflowRepository,
  fetchOptions?: Partial<FetchIssuesOptions>,
): string {
  const fullName = repository.fullName || `${repository.owner}/${repository.repo}`;
  const optionsStr = JSON.stringify(fetchOptions || {});
  return `${fullName}:${optionsStr}`;
}

/**
 * Gets the current cache size
 */
export function getIssuesCacheSize(): number {
  return issuesCache.size;
}

/**
 * Gets cache statistics
 */
export interface IssuesCacheStats {
  size: number;
  entries: Array<{
    key: string;
    issuesCount: number;
    age: number;
  }>;
}

/**
 * Gets cache statistics for debugging/monitoring
 */
export function getIssuesCacheStats(): IssuesCacheStats {
  const now = Date.now();
  const entries = Array.from(issuesCache.entries()).map(([key, value]) => ({
    key,
    issuesCount: value.issues.length,
    age: now - value.timestamp,
  }));

  return {
    size: issuesCache.size,
    entries,
  };
}
