import { PackageInfo, MonorepoInfo, PackageBumpInfo } from "./types.js";
export declare function detectVersioningStrategy(startPath: string): Promise<MonorepoInfo>;
export declare function findChangedPackages(allPackages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]>;
export declare function getRecommendedBump(projectRoot: string): Promise<string>;
export declare function determinePackageBumps(changedPackages: PackageInfo[]): Promise<PackageBumpInfo[]>;
export declare function generateChangelog(monorepoInfo: MonorepoInfo, pkgInfo?: PackageBumpInfo): Promise<string>;
export declare function updatePackageVersion(pkgInfo: PackageBumpInfo): Promise<void>;
export declare function updateAllVersions(monorepoInfo: MonorepoInfo, newVersion: string): Promise<void>;
export declare function performReleaseCommit(packages: PackageBumpInfo[], projectRoot: string): Promise<void>;
