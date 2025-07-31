import { Octokit } from '@octokit/rest';

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
export async function createGitHubRelease(options: GitHubReleaseOptions): Promise<void> {
  const { owner, repo, tagName, releaseNotes, token } = options;
  const octokit = new Octokit({ auth: token });

  console.log(`Creating GitHub release for tag ${tagName}...`);

  await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: tagName,
    name: `Release ${tagName}`, 
    body: releaseNotes,
    prerelease: false, 
  });

  console.log('✅ GitHub release created successfully!');
}