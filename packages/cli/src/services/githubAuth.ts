import fs from "node:fs";
import path from "node:path";
import {
  createCLIAuthProvider,
  createFileTokenStorage,
  createGitHubAuth,
  DEFAULT_GITHUB_TOKEN_FILE,
  DEFAULT_STACKCODE_DIRECTORY,
} from "@stackcode/github-auth";

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

interface RepositoryDetectionOptions {
  cwd?: string;
  verbose?: boolean;
}

const tokenFilePath = path.join(
  DEFAULT_STACKCODE_DIRECTORY,
  DEFAULT_GITHUB_TOKEN_FILE,
);

const tokenStorage = createFileTokenStorage({ filePath: tokenFilePath });

export const githubAuth = createGitHubAuth({
  provider: createCLIAuthProvider({ storage: tokenStorage }),
});

export type AuthenticatedOctokit = Awaited<
  ReturnType<typeof githubAuth.getAuthenticatedClient>
>;

/**
 * Retrieves a persisted GitHub token when available.
 */
export async function getStoredToken(): Promise<string | null> {
  return githubAuth.getStoredToken();
}

/**
 * Saves a GitHub personal access token securely.
 */
export async function saveToken(token: string): Promise<void> {
  await githubAuth.saveToken(token);
}

/**
 * Removes any stored GitHub token.
 */
export async function removeToken(): Promise<void> {
  await githubAuth.removeToken();
}

/**
 * Validates a candidate token by performing a lightweight authenticated request.
 */
export async function validateToken(token: string): Promise<boolean> {
  return githubAuth.validateToken(token);
}

export interface CLIAuthFacade {
  getToken(): Promise<string | null>;
  saveToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  getClient(): Promise<AuthenticatedOctokit>;
}

export function createCLIAuthFacade(): CLIAuthFacade {
  return {
    getToken: () => githubAuth.getStoredToken(),
    saveToken: (token: string) => githubAuth.saveToken(token),
    removeToken: () => githubAuth.removeToken(),
    validateToken: (token: string) => githubAuth.validateToken(token),
    getClient: () => githubAuth.getAuthenticatedClient(),
  };
}

/**
 * Attempts to detect the GitHub repository associated with the provided working directory.
 * Returns null when the remote cannot be inferred.
 */
export function getCurrentRepository(
  options: RepositoryDetectionOptions = {},
): RepositoryInfo | null {
  const cwd = options.cwd ?? process.cwd();
  const verbose = options.verbose ?? false;

  try {
    const configPath = path.join(cwd, ".git", "config");
    if (verbose) {
      console.log(`🔍 Detecting repository in: ${cwd}`);
    }

    if (!fs.existsSync(configPath)) {
      if (verbose) {
        console.log(
          "❌ .git/config not found – are you inside a Git repository?",
        );
      }
      return null;
    }

    const configContent = fs.readFileSync(configPath, "utf8");
    const remoteLine = configContent
      .split("\n")
      .find((line: string) => line.includes("url = "));

    if (!remoteLine) {
      if (verbose) {
        console.log("❌ Could not find a remote URL in .git/config");
      }
      return null;
    }

    const remoteUrl = remoteLine.split("url = ")[1]?.trim();
    if (verbose && remoteUrl) {
      console.log(`🔗 Remote URL detected: ${remoteUrl}`);
    }

    if (!remoteUrl) {
      return null;
    }

    const patterns = [
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/,
      /^git@github\.com:([^/]+)\/([^/]+)(?:\.git)?$/,
      /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/,
    ];

    for (const pattern of patterns) {
      const match = remoteUrl.match(pattern);
      if (match) {
        const info: RepositoryInfo = { owner: match[1], repo: match[2] };
        if (verbose) {
          console.log(`✅ Repository detected: ${info.owner}/${info.repo}`);
        }
        return info;
      }
    }

    if (verbose) {
      console.log("❌ Remote URL did not match known GitHub patterns");
    }
    return null;
  } catch (error) {
    if (verbose) {
      console.log(
        `❌ Failed to detect repository: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    return null;
  }
}
