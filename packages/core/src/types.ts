export type VersioningStrategy = "locked" | "independent" | "unknown";

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

export interface GitHubReleaseOptions {
  owner: string;
  repo: string;
  tagName: string;
  releaseNotes: string;
  token: string;
}
