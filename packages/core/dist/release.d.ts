export type VersioningStrategy = 'locked' | 'independent' | 'unknown';
export interface PackageInfo {
    name: string;
    version?: string;
    path: string;
}
export interface MonorepoInfo {
    strategy: VersioningStrategy;
    rootDir: string;
    rootVersion?: string;
    packages: PackageInfo[];
}
export interface PackageBumpInfo {
    pkg: PackageInfo;
    bumpType: string;
    newVersion: string;
}
export declare function detectVersioningStrategy(startPath: string): Promise<MonorepoInfo>;
export declare function findChangedPackages(allPackages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]>;
export declare function getRecommendedBump(projectRoot: string): Promise<string>;
export declare function updateAllVersions(monorepoInfo: MonorepoInfo, newVersion: string): Promise<void>;
export declare function determinePackageBumps(changedPackages: PackageInfo[]): Promise<PackageBumpInfo[]>;
export declare function generateChangelog(monorepoInfo: MonorepoInfo, pkgInfo?: PackageBumpInfo): Promise<string>;
export declare function updatePackageVersion(pkgInfo: PackageBumpInfo): Promise<void>;
/**
 * Executes the git commands to add, commit, and tag a release.
 * This is the function we are testing.
 */
export declare function performReleaseCommit(pkgInfo: PackageBumpInfo, projectRoot: string): Promise<void>;
