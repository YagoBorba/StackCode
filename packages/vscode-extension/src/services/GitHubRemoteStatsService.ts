import type { Octokit } from "@octokit/rest";
import { GitHubAuthService } from "./GitHubAuthService";
import { GitMonitor } from "../monitors/GitMonitor";

/**
 * GitHub Remote Statistics
 * Fetches data from GitHub API (not local Git)
 */
export interface GitHubRemoteStats {
  // Repository info
  repository: {
    name: string;
    fullName: string;
    owner: string;
    description: string | null;
    url: string;
    isPrivate: boolean;
  };

  // Statistics from GitHub
  stats: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    size: number; // KB
  };

  // Branch info from GitHub
  branches: {
    default: string;
    total: number;
    protected: number;
  };

  // Commit info from GitHub
  commits: {
    total: number; // In default branch
    thisWeek: number;
    thisMonth: number;
  };

  // Contributors from GitHub
  contributors: {
    total: number;
    topContributors: Array<{
      username: string;
      avatarUrl: string;
      contributions: number;
    }>;
  };

  // Languages from GitHub
  languages: Array<{
    name: string;
    percentage: number;
    bytes: number;
  }>;

  // Timestamps
  timestamps: {
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
  };

  // Error handling
  error?: string;
}

/**
 * GitHub Remote Statistics Service
 * 
 * Fetches ALL data from GitHub API (remote), not from local Git.
 * Requires GitHub authentication.
 */
export class GitHubRemoteStatsService {
  constructor(
    private readonly authService: GitHubAuthService,
    private readonly gitMonitor: GitMonitor,
  ) {}

  /**
   * Fetch complete repository statistics from GitHub
   */
  async fetchRemoteStats(): Promise<GitHubRemoteStats> {
    // Ensure authenticated
    if (!this.authService.isAuthenticated) {
      throw new Error("GitHub authentication required");
    }

    // Get current repository
    const repository = await this.gitMonitor.getCurrentGitHubRepository();
    if (!repository) {
      throw new Error("No GitHub repository detected in current workspace");
    }

    const client = await this.authService.getAuthenticatedClient();

    try {
      // Fetch all data in parallel for performance
      const [
        repoData,
        branchesData,
        contributorsData,
        languagesData,
        commitsData,
      ] = await Promise.all([
        this.fetchRepositoryInfo(client, repository.owner, repository.repo),
        this.fetchBranches(client, repository.owner, repository.repo),
        this.fetchContributors(client, repository.owner, repository.repo),
        this.fetchLanguages(client, repository.owner, repository.repo),
        this.fetchRecentCommits(client, repository.owner, repository.repo),
      ]);

      return {
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          owner: repository.owner,
          description: repoData.description,
          url: repoData.html_url,
          isPrivate: repoData.private,
        },
        stats: {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          openIssues: repoData.open_issues_count,
          size: repoData.size,
        },
        branches: {
          default: repoData.default_branch,
          total: branchesData.total,
          protected: branchesData.protected,
        },
        commits: commitsData,
        contributors: {
          total: contributorsData.length,
          topContributors: contributorsData.slice(0, 5).map((c) => ({
            username: c.login || "Unknown",
            avatarUrl: c.avatar_url || "",
            contributions: c.contributions,
          })),
        },
        languages: languagesData,
        timestamps: {
          createdAt: repoData.created_at,
          updatedAt: repoData.updated_at,
          pushedAt: repoData.pushed_at,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch GitHub statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Fetch repository information
   */
  private async fetchRepositoryInfo(
    client: Octokit,
    owner: string,
    repo: string,
  ) {
    const { data } = await client.repos.get({ owner, repo });
    return data;
  }

  /**
   * Fetch branches information
   */
  private async fetchBranches(client: Octokit, owner: string, repo: string) {
    const { data: branches } = await client.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    const protectedCount = branches.filter((b) => b.protected).length;

    return {
      total: branches.length,
      protected: protectedCount,
    };
  }

  /**
   * Fetch contributors
   */
  private async fetchContributors(
    client: Octokit,
    owner: string,
    repo: string,
  ) {
    const { data } = await client.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    });

    return data;
  }

  /**
   * Fetch languages
   */
  private async fetchLanguages(client: Octokit, owner: string, repo: string) {
    const { data } = await client.repos.listLanguages({ owner, repo });

    const total = Object.values(data).reduce((sum: number, bytes) => sum + (bytes as number), 0);

    return Object.entries(data).map(([name, bytes]) => ({
      name,
      percentage: Math.round(((bytes as number) / total) * 100),
      bytes: bytes as number,
    }));
  }

  /**
   * Fetch recent commits statistics
   */
  private async fetchRecentCommits(
    client: Octokit,
    owner: string,
    repo: string,
  ) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Fetch commits from the last month
      const { data: commits } = await client.repos.listCommits({
        owner,
        repo,
        since: oneMonthAgo.toISOString(),
        per_page: 100,
      });

      const thisWeek = commits.filter(
        (c) =>
          c.commit.author?.date &&
          new Date(c.commit.author.date) > oneWeekAgo,
      ).length;

      const thisMonth = commits.length;

      // Get total commits (from repo data)
      const { data: repoData } = await client.repos.get({ owner, repo });

      return {
        total: repoData.size, // Approximate
        thisWeek,
        thisMonth,
      };
    } catch (error) {
      return {
        total: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }
  }

  /**
   * Fetch commit activity (for graphs)
   */
  async fetchCommitActivity(owner: string, repo: string) {
    const client = await this.authService.getAuthenticatedClient();

    try {
      const { data } = await client.repos.getCommitActivityStats({
        owner,
        repo,
      });

      return data;
    } catch {
      return [];
    }
  }

  /**
   * Fetch code frequency (additions/deletions)
   */
  async fetchCodeFrequency(owner: string, repo: string) {
    const client = await this.authService.getAuthenticatedClient();

    try {
      const { data } = await client.repos.getCodeFrequencyStats({
        owner,
        repo,
      });

      return data;
    } catch {
      return [];
    }
  }
}
