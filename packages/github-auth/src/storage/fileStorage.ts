import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { TokenStorage } from "../types.js";

/** Default directory used to persist StackCode configuration data. */
export const DEFAULT_STACKCODE_DIRECTORY = path.join(
  os.homedir(),
  ".stackcode",
);

/** Default filename used to store the GitHub token. */
export const DEFAULT_GITHUB_TOKEN_FILE = "github_token";

/**
 * Options accepted by {@link createFileTokenStorage}.
 */
export interface FileTokenStorageOptions {
  /** Custom absolute path to the token file. */
  filePath?: string;
  /** UNIX permission mask applied to the stored token. */
  mode?: number;
}

/**
 * Ensures the parent directory exists before writing tokens to disk.
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
}

/**
 * Creates a {@link TokenStorage} implementation backed by the local filesystem
 * with secure default permissions suitable for personal access tokens.
 */
export function createFileTokenStorage(
  options: FileTokenStorageOptions = {},
): TokenStorage {
  const filePath =
    options.filePath ??
    path.join(DEFAULT_STACKCODE_DIRECTORY, DEFAULT_GITHUB_TOKEN_FILE);
  const mode = options.mode ?? 0o600;

  return {
    /** @inheritdoc */
    async read(): Promise<string | null> {
      try {
        await fs.access(filePath);
      } catch {
        return null;
      }

      const raw = await fs.readFile(filePath, "utf8");
      return raw.trim() || null;
    },

    /** @inheritdoc */
    async write(token: string): Promise<void> {
      await ensureDirectoryExists(filePath);
      await fs.writeFile(filePath, `${token}\n`, { mode });
      await fs.chmod(filePath, mode);
    },

    /** @inheritdoc */
    async clear(): Promise<void> {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return;
        }
        throw error;
      }
    },
  };
}
