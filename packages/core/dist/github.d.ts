import { Octokit } from "@octokit/rest";
import { GitHubReleaseOptions } from "./types.js";
export interface GitHubIssue {
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
export interface FetchIssuesOptions {
    owner: string;
    repo: string;
    state?: "open" | "closed" | "all";
    assignee?: string;
    labels?: string;
    sort?: "created" | "updated" | "comments";
    direction?: "asc" | "desc";
    per_page?: number;
}
/**
 * Busca issues de um repositório GitHub
 *
 * @param octokit - Cliente Octokit autenticado
 * @param options - Opções de busca
 * @returns Promise com array de issues formatadas
 */
export declare function fetchRepositoryIssues(octokit: Octokit, options: FetchIssuesOptions): Promise<GitHubIssue[]>;
export declare function createGitHubRelease(options: GitHubReleaseOptions): Promise<void>;
