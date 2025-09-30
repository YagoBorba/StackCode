import fs from "fs";
import os from "os";
import path from "path";
import { Octokit } from "@octokit/rest";

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

interface RepositoryDetectionOptions {
  cwd?: string;
  verbose?: boolean;
}

/**
 * Manages GitHub authentication for the CLI by storing and validating tokens
 * in the user's `~/.stackcode` directory.
 */
export class CLIAuthManager {
  private readonly tokenPath: string;

  constructor() {
    const configDir = path.join(os.homedir(), ".stackcode");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.tokenPath = path.join(configDir, "github_token");
  }

  /**
   * Persists a personal access token to the local filesystem with restricted permissions.
   */
  public saveToken(token: string): void {
    fs.writeFileSync(this.tokenPath, token, { mode: 0o600 });
  }

  /**
   * Retrieves a previously saved token, if it exists.
   */
  public getToken(): string | null {
    try {
      if (fs.existsSync(this.tokenPath)) {
        return fs.readFileSync(this.tokenPath, "utf-8").trim();
      }
    } catch (error) {
      console.error("Failed to read GitHub token", error);
    }
    return null;
  }

  /**
   * Deletes the stored GitHub token from the filesystem.
   */
  public removeToken(): void {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
      }
    } catch (error) {
      console.error("Failed to remove GitHub token", error);
    }
  }

  /**
   * Validates the provided token by performing a lightweight request against the GitHub API.
   */
  public async validateToken(token: string): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.users.getAuthenticated();
      return true;
    } catch {
      return false;
    }
  }
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
        console.log("❌ .git/config not found – are you inside a Git repository?");
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
