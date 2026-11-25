/**
 * @fileoverview Helpers to detect work happening directly on long-lived
 * GitFlow branches, where commits should arrive through pull requests.
 */
import { getCommandOutput } from "./utils.js";

/** Branches that should only receive changes through pull requests. */
export const DEFAULT_PROTECTED_BRANCHES: readonly string[] = [
  "main",
  "master",
  "develop",
];

/**
 * Tells whether a branch is one of the protected GitFlow branches.
 * @param branch - Branch name, or null/undefined when unknown (detached HEAD).
 * @param protectedBranches - Branch names to protect.
 */
export function isProtectedBranch(
  branch: string | null | undefined,
  protectedBranches: readonly string[] = DEFAULT_PROTECTED_BRANCHES,
): boolean {
  return Boolean(branch) && protectedBranches.includes(branch as string);
}

/**
 * Returns the checked-out branch, or null outside a repository or on a
 * detached HEAD.
 * @param cwd - Directory inside the repository.
 */
export async function getCurrentBranch(cwd: string): Promise<string | null> {
  try {
    const branch = await getCommandOutput("git", ["branch", "--show-current"], {
      cwd,
    });
    return branch || null;
  } catch {
    return null;
  }
}
