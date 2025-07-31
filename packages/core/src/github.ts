import { Octokit } from '@octokit/rest';
import { GitHubReleaseOptions } from './types.js';

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