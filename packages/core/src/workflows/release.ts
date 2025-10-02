import path from "path";
import semver from "semver";
import {
  detectVersioningStrategy,
  findChangedPackages,
  determinePackageBumps,
  getRecommendedBump,
  updateAllVersions,
  updatePackageVersion,
  generateChangelog,
  performReleaseCommit,
} from "../release.js";
import { getCommandOutput } from "../utils.js";
import type { VersioningStrategy, PackageBumpInfo } from "../types.js";
import fs from "fs/promises";

export type ReleaseWorkflowStep =
  | "detectingStrategy"
  | "lockedRecommendedBump"
  | "lockedUpdatingVersions"
  | "lockedGeneratingChangelog"
  | "independentFindingChanges"
  | "independentDeterminingBumps"
  | "independentPreparingPlan"
  | "independentUpdatingPackages"
  | "independentCommitting"
  | "completed";

export interface ReleaseWorkflowProgress {
  step: ReleaseWorkflowStep;
  message?: string;
}

export interface ReleaseWorkflowOptions {
  cwd: string;
  changelogFilename?: string;
  gitRemote?: string;
  autoCommitIndependent?: boolean;
}

export interface ReleaseWorkflowHooks {
  onProgress?(progress: ReleaseWorkflowProgress): Promise<void> | void;
  confirmLockedRelease?(details: {
    currentVersion: string;
    newVersion: string;
  }): Promise<boolean> | boolean;
  displayIndependentPlan?(plan: PackageBumpInfo[]): Promise<void> | void;
  confirmIndependentRelease?(
    plan: PackageBumpInfo[],
  ): Promise<boolean> | boolean;
}

export interface ReleaseWorkflowGitHubInfo {
  owner: string;
  repo: string;
  remoteUrl: string;
}

export interface ReleaseWorkflowResult {
  status: "prepared" | "cancelled";
  strategy: VersioningStrategy;
  reason?:
    | "invalid-structure"
    | "cancelled-by-user"
    | "no-changes"
    | "no-bumps"
    | "error";
  error?: string;
  newVersion?: string;
  packages?: PackageBumpInfo[];
  releaseNotes?: string;
  tagName?: string;
  github?: ReleaseWorkflowGitHubInfo;
  warnings?: string[];
}

async function resolveGitHubInfo(
  cwd: string,
  remote: string,
): Promise<ReleaseWorkflowGitHubInfo | undefined> {
  try {
    const remoteUrl = await getCommandOutput(
      "git",
      ["remote", "get-url", remote],
      { cwd },
    );
    const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    if (!match) {
      return undefined;
    }
    const [owner, repoWithSuffix] = match[1].split("/");
    const repo = repoWithSuffix.replace(/\.git$/, "");
    return { owner, repo, remoteUrl };
  } catch {
    return undefined;
  }
}

/**
 * Orchestrates the complete release workflow for monorepos.
 *
 * Supports both locked (synchronized) and independent versioning strategies.
 * For locked releases, bumps all packages to the same version. For independent
 * releases, analyzes changed packages and determines individual version bumps.
 * Generates changelogs, updates version files, and prepares release metadata.
 *
 * @param options - Release configuration including working directory and options
 * @param hooks - UI callbacks for confirmations, progress, and plan display
 * @returns Result with release metadata, version bumps, and GitHub information
 */
export async function runReleaseWorkflow(
  options: ReleaseWorkflowOptions,
  hooks: ReleaseWorkflowHooks = {},
): Promise<ReleaseWorkflowResult> {
  const report = async (progress: ReleaseWorkflowProgress) => {
    if (hooks.onProgress) {
      await hooks.onProgress(progress);
    }
  };

  const changelogFilename = options.changelogFilename ?? "CHANGELOG.md";
  const gitRemote = options.gitRemote ?? "origin";
  const autoCommitIndependent =
    typeof options.autoCommitIndependent === "boolean"
      ? options.autoCommitIndependent
      : true;

  let currentStrategy: VersioningStrategy = "unknown";

  try {
    await report({ step: "detectingStrategy" });
    const monorepoInfo = await detectVersioningStrategy(options.cwd);
    currentStrategy = monorepoInfo.strategy;

    if (monorepoInfo.strategy === "unknown") {
      return {
        status: "cancelled",
        strategy: monorepoInfo.strategy,
        reason: "invalid-structure",
      };
    }

    if (monorepoInfo.strategy === "locked") {
      await report({ step: "lockedRecommendedBump" });
      const bumpType = await getRecommendedBump(monorepoInfo.rootDir);
      const currentVersion = monorepoInfo.rootVersion ?? "0.0.0";
      const nextVersion = semver.inc(
        currentVersion,
        bumpType as semver.ReleaseType,
      );
      if (!nextVersion) {
        return {
          status: "cancelled",
          strategy: "locked",
          reason: "error",
          error: "Unable to calculate next version",
        };
      }

      let shouldProceed = true;
      if (hooks.confirmLockedRelease) {
        shouldProceed = await hooks.confirmLockedRelease({
          currentVersion,
          newVersion: nextVersion,
        });
      }

      if (!shouldProceed) {
        return {
          status: "cancelled",
          strategy: "locked",
          reason: "cancelled-by-user",
          newVersion: nextVersion,
        };
      }

      await report({ step: "lockedUpdatingVersions" });
      await updateAllVersions(monorepoInfo, nextVersion);

      await report({ step: "lockedGeneratingChangelog" });
      const changelog = await generateChangelog(monorepoInfo);
      const changelogPath = path.join(options.cwd, changelogFilename);
      const existing = await fs
        .readFile(changelogPath, "utf-8")
        .catch(() => "");
      await fs.writeFile(
        changelogPath,
        existing ? `${changelog}\n${existing}` : `${changelog}\n`,
      );

      const github = await resolveGitHubInfo(options.cwd, gitRemote);

      await report({ step: "completed" });
      return {
        status: "prepared",
        strategy: "locked",
        newVersion: nextVersion,
        releaseNotes: changelog,
        tagName: `v${nextVersion}`,
        github,
      };
    }

    await report({ step: "independentFindingChanges" });
    const changedPackages = await findChangedPackages(
      monorepoInfo.packages,
      monorepoInfo.rootDir,
    );

    if (changedPackages.length === 0) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "no-changes",
      };
    }

    await report({ step: "independentDeterminingBumps" });
    const packagesToUpdate = await determinePackageBumps(changedPackages);

    if (packagesToUpdate.length === 0) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "no-bumps",
      };
    }

    await report({ step: "independentPreparingPlan" });
    if (hooks.displayIndependentPlan) {
      await hooks.displayIndependentPlan(packagesToUpdate);
    }

    let shouldContinue = true;
    if (hooks.confirmIndependentRelease) {
      shouldContinue = await hooks.confirmIndependentRelease(packagesToUpdate);
    }

    if (!shouldContinue) {
      return {
        status: "cancelled",
        strategy: "independent",
        reason: "cancelled-by-user",
        packages: packagesToUpdate,
      };
    }

    await report({ step: "independentUpdatingPackages" });
    const combinedNotes: string[] = [];
    for (const pkgInfo of packagesToUpdate) {
      await updatePackageVersion(pkgInfo);
      const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
      const changelogPath = path.join(pkgInfo.pkg.path, "CHANGELOG.md");
      const existing = await fs
        .readFile(changelogPath, "utf-8")
        .catch(() => "");
      await fs.writeFile(
        changelogPath,
        existing ? `${changelogContent}\n${existing}` : `${changelogContent}\n`,
      );
      combinedNotes.push(
        `### 🎉 Release for ${pkgInfo.pkg.name}@${pkgInfo.newVersion}\n\n${changelogContent}`,
      );
    }

    if (autoCommitIndependent) {
      await report({ step: "independentCommitting" });
      await performReleaseCommit(packagesToUpdate, monorepoInfo.rootDir);
    }

    const releaseNotes = combinedNotes.join("\n\n");
    const primaryPackage =
      packagesToUpdate.find((p) => p.pkg.name === "@stackcode/cli") ||
      packagesToUpdate[0];
    const shortName =
      primaryPackage.pkg.name.split("/")[1] || primaryPackage.pkg.name;
    const tagName = `${shortName}@${primaryPackage.newVersion}`;
    const github = await resolveGitHubInfo(options.cwd, gitRemote);

    await report({ step: "completed" });
    return {
      status: "prepared",
      strategy: "independent",
      packages: packagesToUpdate,
      releaseNotes,
      tagName,
      github,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "cancelled",
      strategy: currentStrategy,
      reason: "error",
      error: message,
    };
  }
}
