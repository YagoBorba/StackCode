/**
 * Interface for the options required to create a GitHub release.
 */
export interface GitHubReleaseOptions {
    owner: string;
    repo: string;
    tagName: string;
    releaseNotes: string;
    token: string;
}
/**
 * Creates a new release on GitHub.
 * @param options The release options.
 */
export declare function createGitHubRelease(options: GitHubReleaseOptions): Promise<void>;
