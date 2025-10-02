/**
 * @fileoverview Release management utilities for versioning and changelog generation.
 * Supports both monorepo (independent/locked) and single-package strategies.
 */
import { PackageInfo, MonorepoInfo, PackageBumpInfo } from "./types.js";
/**
 * Detects the versioning strategy of a project (monorepo or single package).
 *
 * @param startPath - Starting directory to analyze
 * @returns Monorepo information including strategy, packages, and versions
 */
export declare function detectVersioningStrategy(startPath: string): Promise<MonorepoInfo>;
/**
 * Finds packages that have changes since their last git tag.
 *
 * @param allPackages - Array of all packages to check
 * @param projectRoot - Root directory of the project
 * @returns Array of packages that have been modified
 */
export declare function findChangedPackages(allPackages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]>;
/**
 * Gets the recommended version bump type based on conventional commits.
 *
 * @param projectRoot - Root directory of the project
 * @returns Recommended bump type ('major', 'minor', or 'patch')
 */
export declare function getRecommendedBump(projectRoot: string): Promise<string>;
/**
 * Determines version bumps for each changed package based on conventional commits.
 *
 * @param changedPackages - Array of packages that have changes
 * @param projectRoot - Root directory of the project
 * @returns Array of package bump information
 */
export declare function determinePackageBumps(changedPackages: PackageInfo[]): Promise<PackageBumpInfo[]>;
/**
 * Generates a changelog based on conventional commits.
 *
 * @param monorepoInfo - Monorepo information
 * @param pkgInfo - Optional package bump info for package-specific changelog
 * @returns Promise resolving to the generated changelog content
 */
export declare function generateChangelog(monorepoInfo: MonorepoInfo, pkgInfo?: PackageBumpInfo): Promise<string>;
/**
 * Updates the version field in a package's package.json file.
 *
 * @param pkgInfo - Package bump information containing the new version
 * @returns Promise that resolves when the file is updated
 */
export declare function updatePackageVersion(pkgInfo: PackageBumpInfo): Promise<void>;
/**
 * Updates all package versions to a single version (locked strategy).
 *
 * @param monorepoInfo - Monorepo information
 * @param newVersion - New version to apply to all packages
 * @returns Promise that resolves when all versions are updated
 */
export declare function updateAllVersions(monorepoInfo: MonorepoInfo, newVersion: string): Promise<void>;
/**
 * Commits release changes and creates git tags for released packages.
 *
 * @param packages - Array of package bump information
 * @param projectRoot - Root directory of the project
 * @returns Promise that resolves when commit and tags are created
 */
export declare function performReleaseCommit(packages: PackageBumpInfo[], projectRoot: string): Promise<void>;
